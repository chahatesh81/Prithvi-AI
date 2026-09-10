from fastapi import APIRouter, Query
from app.schemas.impact import ImpactAssessmentResponse
from app.schemas.common import APIResponse
from app.services.impact_service import impact_service

router = APIRouter(prefix="/impact", tags=["Impact Assessment"])


@router.get("", response_model=APIResponse[ImpactAssessmentResponse])
async def get_impact_assessment(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    risk_score: float = Query(72.0, ge=0.0, le=100.0),
    risk_level: str = Query("HIGH")
):
    impact = impact_service.calculate_impact(latitude, longitude, risk_score, risk_level)
    return APIResponse(data=impact)
