from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    threshold = Column(Integer, nullable=False)
    hysteresis = Column(Integer, nullable=False)
    cooldown_hours = Column(Integer, nullable=False)
    sensor_channel = Column(Integer, nullable=False)
    pump_gpio = Column(Integer, nullable=True)
    enabled = Column(Boolean, default=True)

    readings = relationship("Reading", back_populates="zone")
    pump_events = relationship("PumpEvent", back_populates="zone")


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"))
    value = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="readings")


class PumpEvent(Base):
    __tablename__ = "pump_events"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"))
    action = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    duration_sec = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="pump_events")
