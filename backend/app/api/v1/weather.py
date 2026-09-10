from fastapi import APIRouter, Query
from app.schemas.weather import WeatherObservationResponse
from app.schemas.common import APIResponse
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("", response_model=APIResponse[WeatherObservationResponse])
async def get_weather(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0)
):
    data = await weather_service.get_weather_for_location(latitude, longitude)
    return APIResponse(data=data)
