from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.locations import router as locations_router
from app.api.v1.weather import router as weather_router
from app.api.v1.satellite import router as satellite_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.risk import router as risk_router
from app.api.v1.impact import router as impact_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.explanations import router as explanations_router
from app.api.v1.history import router as history_router
from app.api.v1.simulate import router as simulate_router
from app.api.v1.routes import router as routes_router
from app.api.v1.dashboard import router as dashboard_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(locations_router)
api_v1_router.include_router(weather_router)
api_v1_router.include_router(satellite_router)
api_v1_router.include_router(predictions_router)
api_v1_router.include_router(risk_router)
api_v1_router.include_router(impact_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(explanations_router)
api_v1_router.include_router(history_router)
api_v1_router.include_router(simulate_router)
api_v1_router.include_router(routes_router)
api_v1_router.include_router(dashboard_router)
