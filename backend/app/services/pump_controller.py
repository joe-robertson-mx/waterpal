from __future__ import annotations

from time import sleep
from typing import Optional

try:
    from gpiozero import OutputDevice  # type: ignore
except Exception:  # pragma: no cover
    OutputDevice = None


class PumpController:
    def __init__(self) -> None:
        self._outputs: dict[int, OutputDevice] = {}

    def run(self, gpio_pin: Optional[int], duration_sec: int) -> bool:
        if gpio_pin is None:
            return False
        if OutputDevice is None:
            return True

        device = self._outputs.get(gpio_pin)
        if device is None:
            device = OutputDevice(gpio_pin, active_high=True, initial_value=False)
            self._outputs[gpio_pin] = device

        device.on()
        sleep(duration_sec)
        device.off()
        return True
