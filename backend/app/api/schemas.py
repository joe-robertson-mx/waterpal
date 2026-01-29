from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ZoneOut(BaseModel):
    id: int
    name: str
    threshold: int
    hysteresis: int
    cooldown_hours: int
    sensor_channel: int
    pump_gpio: Optional[int]
    enabled: bool

    class Config:
        from_attributes = True


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    threshold: Optional[int] = None
    hysteresis: Optional[int] = None
    cooldown_hours: Optional[int] = None
    pump_gpio: Optional[int] = None
    enabled: Optional[bool] = None


class ReadingOut(BaseModel):
    id: int
    zone_id: int
    value: int
    created_at: datetime

    class Config:
        from_attributes = True


class PumpEventOut(BaseModel):
    id: int
    zone_id: int
    action: str
    reason: str
    duration_sec: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class StatusItem(BaseModel):
    zone: ZoneOut
    latest_reading: Optional[ReadingOut]
    last_pump_event: Optional[PumpEventOut]


class ManualWaterRequest(BaseModel):
    duration_sec: int = Field(default=10, ge=1, le=600)
