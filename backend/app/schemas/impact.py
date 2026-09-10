from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ExposureAsset(BaseModel):
    asset_id: str
    asset_type: str  # school, hospital, bridge, road_segment
    name: str
    risk_level: str
    distance_meters: float


class ImpactAssessmentResponse(BaseModel):
    prediction_id: Optional[str] = None
    affected_population_estimate: int = Field(0, ge=0)
    exposed_road_length_km: float = Field(0.0, ge=0.0)
    exposed_buildings_count: int = Field(0, ge=0)
    critical_infrastructure_count: int = Field(0, ge=0)
    severity_rating: str = "MODERATE"
    critical_assets: List[ExposureAsset] = []
