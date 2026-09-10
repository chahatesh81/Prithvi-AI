from fastapi import APIRouter, Query
from app.schemas.satellite import SatelliteIndicesResponse
from app.schemas.common import APIResponse
from app.services.satellite_service import satellite_service

router = APIRouter(prefix="/satellite", tags=["Satellite"])


@router.get("", response_model=APIResponse[SatelliteIndicesResponse])
async def get_satellite_data(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0)
):
    data = await satellite_service.get_satellite_for_location(latitude, longitude)
    return APIResponse(data=data)
