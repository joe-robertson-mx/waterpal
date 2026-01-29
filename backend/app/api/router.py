from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.api.schemas import (
    AlertEventOut,
    ManualWaterRequest,
    PumpEventOut,
    ReadingOut,
    StatusItem,
    ZoneCreate,
    ZoneOut,
    ZoneUpdate,
)
from app.config import settings
from app.db.session import SessionLocal
from app.models import AlertEvent, PumpEvent, Reading, Zone
from app.services.monitoring import run_monitoring_cycle

router = APIRouter(prefix="/api")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/zones", response_model=List[ZoneOut])
def list_zones(db: Session = Depends(get_db)):
    return db.query(Zone).order_by(Zone.id).all()


@router.post("/zones", response_model=ZoneOut, status_code=201)
def create_zone(payload: ZoneCreate, db: Session = Depends(get_db)):
    zone = Zone(**payload.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.patch("/zones/{zone_id}", response_model=ZoneOut)
def update_zone(zone_id: int, payload: ZoneUpdate, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)

    db.commit()
    db.refresh(zone)
    return zone


@router.delete("/zones/{zone_id}", status_code=204)
def delete_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return None


@router.post("/zones/{zone_id}/water", response_model=PumpEventOut)
def manual_water(
    zone_id: int,
    payload: ManualWaterRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    if not zone.enabled:
        raise HTTPException(status_code=400, detail="Zone disabled")

    requested_duration = payload.duration_sec or zone.water_duration_sec
    max_duration = min(requested_duration, settings.max_pump_seconds)
    pump_controller = request.app.state.pump_controller
    ran = pump_controller.run(zone.pump_gpio, max_duration)

    event = PumpEvent(
        zone_id=zone.id,
        action="manual",
        reason="manual",
        duration_sec=max_duration if ran else None,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/readings", response_model=List[ReadingOut])
def list_readings(
    zone_id: Optional[int] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Reading)
    if zone_id is not None:
        query = query.filter(Reading.zone_id == zone_id)
    if start is not None:
        query = query.filter(Reading.created_at >= start)
    if end is not None:
        query = query.filter(Reading.created_at <= end)
    return query.order_by(desc(Reading.created_at)).limit(500).all()


@router.get("/pump-events", response_model=List[PumpEventOut])
def list_pump_events(
    zone_id: Optional[int] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    query = db.query(PumpEvent)
    if zone_id is not None:
        query = query.filter(PumpEvent.zone_id == zone_id)
    if start is not None:
        query = query.filter(PumpEvent.created_at >= start)
    if end is not None:
        query = query.filter(PumpEvent.created_at <= end)
    return query.order_by(desc(PumpEvent.created_at)).limit(500).all()


@router.get("/alerts", response_model=List[AlertEventOut])
def list_alerts(
    zone_id: Optional[int] = None,
    alert_type: Optional[str] = None,
    acknowledged: Optional[bool] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    query = db.query(AlertEvent)
    if zone_id is not None:
        query = query.filter(AlertEvent.zone_id == zone_id)
    if alert_type is not None:
        query = query.filter(AlertEvent.alert_type == alert_type)
    if acknowledged is not None:
        query = query.filter(AlertEvent.acknowledged == acknowledged)
    if start is not None:
        query = query.filter(AlertEvent.created_at >= start)
    if end is not None:
        query = query.filter(AlertEvent.created_at <= end)
    return query.order_by(desc(AlertEvent.created_at)).limit(200).all()


@router.post("/alerts/{alert_id}/ack", response_model=AlertEventOut)
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(AlertEvent).filter(AlertEvent.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if not alert.acknowledged:
        alert.acknowledged = True
        alert.acknowledged_at = datetime.utcnow()
        db.commit()
    db.refresh(alert)
    return alert


@router.get("/status", response_model=List[StatusItem])
def get_status(db: Session = Depends(get_db)):
    zones = db.query(Zone).order_by(Zone.id).all()
    status_items: List[StatusItem] = []
    for zone in zones:
        latest_reading = (
            db.query(Reading)
            .filter(Reading.zone_id == zone.id)
            .order_by(desc(Reading.created_at))
            .first()
        )
        last_event = (
            db.query(PumpEvent)
            .filter(PumpEvent.zone_id == zone.id)
            .order_by(desc(PumpEvent.created_at))
            .first()
        )
        status_items.append(
            StatusItem(
                zone=zone,
                latest_reading=latest_reading,
                last_pump_event=last_event,
            )
        )
    return status_items


@router.post("/run-cycle")
def run_cycle(request: Request, db: Session = Depends(get_db)):
    sensor_manager = request.app.state.sensor_manager
    pump_controller = request.app.state.pump_controller
    return run_monitoring_cycle(db, sensor_manager, pump_controller)


@router.post("/reset-db")
def reset_db(db: Session = Depends(get_db)):
    db.query(AlertEvent).delete()
    db.query(PumpEvent).delete()
    db.query(Reading).delete()
    db.query(Zone).delete()
    db.commit()
    return {"status": "reset"}
