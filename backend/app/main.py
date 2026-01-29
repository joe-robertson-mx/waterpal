from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from app.api.router import router as api_router
from app.config import settings
from app.db.init_db import init_db, seed_zones
from app.db.session import SessionLocal, engine
from app.services.monitoring import run_monitoring_cycle
from app.services.pump_controller import PumpController
from app.services.sensor_manager import SensorManager

app = FastAPI(title="WaterPal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def on_startup() -> None:
    init_db(engine)
    db = SessionLocal()
    try:
        seed_zones(db)
    finally:
        db.close()

    app.state.sensor_manager = SensorManager()
    app.state.pump_controller = PumpController()

    scheduler = BackgroundScheduler()
    scheduler.add_job(
        _scheduled_cycle,
        "interval",
        hours=settings.read_interval_hours,
        id="monitoring-cycle",
        replace_existing=True,
    )
    scheduler.start()
    app.state.scheduler = scheduler


@app.on_event("shutdown")
def on_shutdown() -> None:
    scheduler = getattr(app.state, "scheduler", None)
    if scheduler:
        scheduler.shutdown()


def _scheduled_cycle() -> None:
    db = SessionLocal()
    try:
        run_monitoring_cycle(db, app.state.sensor_manager, app.state.pump_controller)
    finally:
        db.close()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"message": "connected"})
    await websocket.close()
