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

## Docker Compose
Build and run everything with Docker:
`docker compose up --build`

- Frontend: http://localhost:8080
- Backend: http://localhost:8000

## Docker Hub images (Raspberry Pi)
This repo now publishes multi-arch images (amd64 + arm64) to Docker Hub via GitHub Actions.

### Set up Docker Hub secrets in GitHub
Create repo secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

Push to `main` (or tag `v*`) to build/push:
- `${DOCKERHUB_USERNAME}/waterpal-backend:latest`
- `${DOCKERHUB_USERNAME}/waterpal-frontend:latest`

### Run on a Raspberry Pi (pull latest images)
1) Set your Docker Hub username:
	`DOCKERHUB_USERNAME=your-dockerhub`
2) Pull and run:
	`docker compose pull`
	`docker compose up -d`

If you want to build locally instead, use:
`docker compose up --build`

## Notes
- Sensor readings are simulated by default. Set `SIMULATE_SENSORS=false` to use ADS1115 on the Pi.
- Pump control is simulated by default on Windows. Set `SIMULATE_PUMPS=false` on the Pi.
- Update GPIO pins in the zone configuration once hardware is connected.
