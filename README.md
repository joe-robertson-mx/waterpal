# WaterPal

Raspberry Pi soil moisture monitoring and automated watering with a local React UI.

## Backend (Python + FastAPI)
- Uses uv for dependency management.
- Service runs scheduled readings and pump control.

### Run backend (dev)
1) Install dependencies: `uv sync --dev`
2) Start API: `uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Run backend tests
`uv run pytest`

## Frontend (React + Vite)
### Run frontend (dev)
1) Install dependencies: `npm install`
2) Start UI: `npm run dev`

### Run frontend tests
`npm run test -- --run`

## Notes
- Sensor readings are simulated by default. Set `SIMULATE_SENSORS=false` to use ADS1115 on the Pi.
- Update GPIO pins in the zone configuration once hardware is connected.
