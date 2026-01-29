from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Base, Zone


def init_db(engine) -> None:
    Base.metadata.create_all(bind=engine)
    _ensure_zone_schema(engine)
    _ensure_alert_schema(engine)


def _ensure_zone_schema(engine) -> None:
    with engine.begin() as connection:
        columns = connection.execute(text("PRAGMA table_info(zones)"))
        column_names = {row[1] for row in columns}
        if "water_duration_sec" not in column_names:
            connection.execute(
                text("ALTER TABLE zones ADD COLUMN water_duration_sec INTEGER NOT NULL DEFAULT 30")
            )
            connection.execute(text("UPDATE zones SET water_duration_sec = 30"))


def _ensure_alert_schema(engine) -> None:
    with engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE IF NOT EXISTS alert_events ("
                "id INTEGER PRIMARY KEY,"
                "zone_id INTEGER,"
                "alert_type VARCHAR NOT NULL,"
                "message VARCHAR NOT NULL,"
                "created_at DATETIME,"
                "acknowledged BOOLEAN DEFAULT 0,"
                "acknowledged_at DATETIME"
                ")"
            )
        )
        columns = connection.execute(text("PRAGMA table_info(alert_events)"))
        column_names = {row[1] for row in columns}
        if "acknowledged" not in column_names:
            connection.execute(
                text("ALTER TABLE alert_events ADD COLUMN acknowledged BOOLEAN DEFAULT 0")
            )
        if "acknowledged_at" not in column_names:
            connection.execute(
                text("ALTER TABLE alert_events ADD COLUMN acknowledged_at DATETIME")
            )


def seed_zones(db: Session) -> None:
    if db.query(Zone).count() > 0:
        return

    zones = [
        Zone(
            name="Zone 1",
            threshold=settings.default_threshold,
            hysteresis=settings.default_hysteresis,
            cooldown_hours=settings.cooldown_hours,
            water_duration_sec=settings.max_pump_seconds,
            sensor_channel=0,
            pump_gpio=17,
            enabled=True,
        ),
        Zone(
            name="Zone 2",
            threshold=settings.default_threshold,
            hysteresis=settings.default_hysteresis,
            cooldown_hours=settings.cooldown_hours,
            water_duration_sec=settings.max_pump_seconds,
            sensor_channel=1,
            pump_gpio=27,
            enabled=True,
        ),
        Zone(
            name="Zone 3",
            threshold=settings.default_threshold,
            hysteresis=settings.default_hysteresis,
            cooldown_hours=settings.cooldown_hours,
            water_duration_sec=settings.max_pump_seconds,
            sensor_channel=2,
            pump_gpio=22,
            enabled=True,
        ),
    ]

    db.add_all(zones)
    db.commit()
