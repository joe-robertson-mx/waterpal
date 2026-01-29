from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config import settings
from app.models import AlertEvent, PumpEvent, Reading, Zone
from app.services.pump_controller import PumpController
from app.services.sensor_manager import SensorManager


def run_monitoring_cycle(
    db: Session,
    sensor_manager: SensorManager,
    pump_controller: PumpController,
) -> Dict[str, int]:
    now = datetime.utcnow()
    zones = db.query(Zone).filter(Zone.enabled == True).order_by(Zone.id).all()
    readings_saved = 0
    pumps_run = 0

    for zone in zones:
        value = sensor_manager.read_channel(zone.sensor_channel)
        if value is None:
            continue

        reading = Reading(zone_id=zone.id, value=value)
        db.add(reading)
        readings_saved += 1

        _maybe_alert_low_moisture(db, zone, value, now)

        last_event = (
            db.query(PumpEvent)
            .filter(PumpEvent.zone_id == zone.id)
            .order_by(desc(PumpEvent.created_at))
            .first()
        )

        if not _should_water(zone, value, last_event, now):
            continue

        duration = min(zone.water_duration_sec, settings.max_pump_seconds)
        ran = pump_controller.run(zone.pump_gpio, duration)
        if ran:
            pumps_run += 1
            db.add(
                PumpEvent(
                    zone_id=zone.id,
                    action="auto",
                    reason="threshold",
                    duration_sec=duration,
                )
            )
        else:
            db.add(
                AlertEvent(
                    zone_id=zone.id,
                    alert_type="pump_failed",
                    message="Pump failed to run during automatic cycle.",
                )
            )

    db.commit()
    return {"readings_saved": readings_saved, "pumps_run": pumps_run}


def _should_water(zone: Zone, value: int, last_event: PumpEvent | None, now: datetime) -> bool:
    if value >= zone.threshold:
        return False

    if last_event is None:
        return True

    cooldown = timedelta(hours=zone.cooldown_hours)
    if now - last_event.created_at < cooldown:
        return False

    return True


def _maybe_alert_low_moisture(db: Session, zone: Zone, value: int, now: datetime) -> None:
    if value >= zone.threshold:
        return

    last_alert = (
        db.query(AlertEvent)
        .filter(AlertEvent.zone_id == zone.id, AlertEvent.alert_type == "low_moisture")
        .order_by(desc(AlertEvent.created_at))
        .first()
    )

    cooldown = timedelta(hours=zone.cooldown_hours)
    if last_alert and now - last_alert.created_at < cooldown:
        return

    db.add(
        AlertEvent(
            zone_id=zone.id,
            alert_type="low_moisture",
            message=f"Moisture reading {value} below threshold {zone.threshold}.",
        )
    )
