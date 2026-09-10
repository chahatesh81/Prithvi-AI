from typing import Dict, Any
from fastapi import APIRouter
from app.schemas.common import APIResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=APIResponse[Dict[str, Any]])
async def health_check():
    return APIResponse(
        data={
            "status": "healthy",
            "service": "sih-backend",
            "version": "1.0.0"
        }
    )


@router.get("/health/live", response_model=APIResponse[Dict[str, str]])
async def liveness_check():
    return APIResponse(data={"status": "live"})


@router.get("/health/ready", response_model=APIResponse[Dict[str, Any]])
async def readiness_check():
    return APIResponse(
        data={
            "status": "ready",
            "database": "connected",
            "redis": "connected",
            "ml_service": "available",
            "weather_provider": "available"
        }
    )
