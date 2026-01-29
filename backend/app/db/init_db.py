from sqlalchemy.orm import Session

from app.config import settings
from app.models import Base, Zone


def init_db(engine) -> None:
    Base.metadata.create_all(bind=engine)


def seed_zones(db: Session) -> None:
    if db.query(Zone).count() > 0:
        return

    zones = [
        Zone(
            name="Zone 1",
            threshold=settings.default_threshold,
            hysteresis=settings.default_hysteresis,
            cooldown_hours=settings.cooldown_hours,
            sensor_channel=0,
            pump_gpio=17,
            enabled=True,
        ),
        Zone(
            name="Zone 2",
            threshold=settings.default_threshold,
            hysteresis=settings.default_hysteresis,
            cooldown_hours=settings.cooldown_hours,
            sensor_channel=1,
            pump_gpio=27,
            enabled=True,
        ),
        Zone(
            name="Zone 3",
            threshold=settings.default_threshold,
            hysteresis=settings.default_hysteresis,
            cooldown_hours=settings.cooldown_hours,
            sensor_channel=2,
            pump_gpio=22,
            enabled=True,
        ),
    ]

    db.add_all(zones)
    db.commit()
