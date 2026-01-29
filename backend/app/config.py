from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    read_interval_hours: int = int(os.getenv("READ_INTERVAL_HOURS", "4"))
    default_threshold: int = int(os.getenv("DEFAULT_THRESHOLD", "16000"))
    default_hysteresis: int = int(os.getenv("DEFAULT_HYSTERESIS", "800"))
    max_pump_seconds: int = int(os.getenv("MAX_PUMP_SECONDS", "30"))
    cooldown_hours: int = int(os.getenv("COOLDOWN_HOURS", "4"))
    simulate_sensors: bool = os.getenv("SIMULATE_SENSORS", "true").lower() == "true"
    simulate_pumps: bool = os.getenv(
        "SIMULATE_PUMPS",
        "true" if os.name == "nt" else "false",
    ).lower() == "true"


settings = Settings()
