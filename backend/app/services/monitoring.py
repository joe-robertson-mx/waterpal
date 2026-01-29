from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config import settings
from app.models import PumpEvent, Reading, Zone
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

        last_event = (
            db.query(PumpEvent)
            .filter(PumpEvent.zone_id == zone.id)
            .order_by(desc(PumpEvent.created_at))
            .first()
        )

        if not _should_water(zone, value, last_event, now):
            continue

        ran = pump_controller.run(zone.pump_gpio, settings.max_pump_seconds)
        if ran:
            pumps_run += 1
            db.add(
                PumpEvent(
                    zone_id=zone.id,
                    action="auto",
                    reason="threshold",
                    duration_sec=settings.max_pump_seconds,
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
