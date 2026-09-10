from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.schemas.common import CoordinatesSchema
from app.schemas.weather import WeatherObservationResponse
from app.schemas.prediction import PredictionResponse
from app.schemas.impact import ImpactAssessmentResponse
from app.schemas.alert import AlertResponse


class DashboardSummaryResponse(BaseModel):
    location_id: str
    location_name: str
    coordinates: CoordinatesSchema
    current_weather: WeatherObservationResponse
    latest_prediction: PredictionResponse
    impact_assessment: ImpactAssessmentResponse
    active_alerts: List[AlertResponse] = []
    risk_trend: str = "STABLE"  # INCREASING, DECREASING, STABLE
    timestamp: datetime
