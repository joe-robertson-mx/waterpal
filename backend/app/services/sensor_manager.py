from __future__ import annotations

import random
from typing import Optional

from app.config import settings

try:
    import smbus2  # type: ignore
except Exception:  # pragma: no cover
    smbus2 = None


class SensorManager:
    def __init__(self, i2c_bus: int = 1, adc_address: int = 0x48) -> None:
        self.i2c_bus = i2c_bus
        self.adc_address = adc_address
        self._bus = smbus2.SMBus(i2c_bus) if smbus2 and not settings.simulate_sensors else None

    def read_channel(self, channel: int) -> Optional[int]:
        if settings.simulate_sensors or self._bus is None:
            base = 15000 + channel * 1200
            return base + random.randint(-400, 400)

        return self._read_ads1115(channel)

    def _read_ads1115(self, channel: int) -> Optional[int]:
        if channel not in (0, 1, 2, 3):
            return None

        config = 0x8000
        config |= 0x4000 | (channel << 12)
        config |= 0x0200
        config |= 0x0080
        config |= 0x0003

        if not self._bus:
            return None

        self._bus.write_i2c_block_data(self.adc_address, 0x01, [config >> 8, config & 0xFF])
        raw = self._bus.read_i2c_block_data(self.adc_address, 0x00, 2)
        value = (raw[0] << 8) | raw[1]
        if value & 0x8000:
            value -= 1 << 16
        return value
