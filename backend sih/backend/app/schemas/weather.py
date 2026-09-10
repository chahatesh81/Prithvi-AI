from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.common import CoordinatesSchema


class WeatherObservationResponse(BaseModel):
    temperature: Optional[float] = Field(None, description="Temperature in Celsius")
    humidity: Optional[float] = Field(None, description="Humidity percentage")
    rainfall_1h: float = Field(0.0, description="1-hour rainfall in mm")
    rainfall_24h: float = Field(0.0, description="24-hour rainfall accumulation in mm")
    rainfall_3d: float = Field(0.0, description="3-day rainfall accumulation in mm")
    rainfall_7d: float = Field(0.0, description="7-day rainfall accumulation in mm")
    rainfall_intensity: float = Field(0.0, description="Rainfall intensity mm/hr")
    wind_speed: Optional[float] = Field(None, description="Wind speed in km/h")
    soil_moisture: Optional[float] = Field(None, description="Soil moisture ratio")
    observation_time: datetime
    retrieved_at: datetime
    source: str = "OpenMeteo"
    data_mode: str = "LIVE"
