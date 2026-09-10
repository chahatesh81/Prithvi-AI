from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.common import APIResponse
from app.services.prediction_service import prediction_service
from app.schemas.prediction import PredictionRequest

router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("/{location_id}", response_model=APIResponse[Dict[str, Any]])
async def get_location_risk(
    location_id: str,
    latitude: float = Query(31.1048, ge=-90.0, le=90.0),
    longitude: float = Query(77.1734, ge=-180.0, le=180.0),
    db: AsyncSession = Depends(get_db)
):
    pred_req = PredictionRequest(latitude=latitude, longitude=longitude, location_id=location_id)
    result = await prediction_service.predict_dual_hazard(pred_req, db=db)
    
    return APIResponse(
        data={
            "location_id": location_id,
            "risk_score": result.combined_risk,
            "risk_level": result.risk_level,
            "flood_probability": result.flood.probability if result.flood else 0.0,
            "landslide_probability": result.landslide.probability if result.landslide else 0.0,
            "timestamp": result.prediction_timestamp
        }
    )


@router.get("/{location_id}/trend", response_model=APIResponse[Dict[str, Any]])
async def get_risk_trend(location_id: str):
    return APIResponse(
        data={
            "location_id": location_id,
            "trend_direction": "INCREASING",
            "delta_24h": "+14.2",
            "historical_observations_count": 28,
            "trend_status": "HIGH_RISK_WARNING"
        }
    )
