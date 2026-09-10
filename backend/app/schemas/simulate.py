from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.common import CoordinatesSchema


class SimulationRequest(CoordinatesSchema):
    location_id: Optional[str] = None
    rainfall_delta_percent: float = Field(0.0, ge=-100.0, le=500.0, description="Percentage change in rainfall (-100% to +500%)")
    rainfall_intensity_mm_hr: Optional[float] = Field(None, ge=0.0, description="Explicit rainfall intensity in mm/hr")
    duration_hours: int = Field(24, ge=1, le=168, description="Rainfall duration in hours")
    soil_moisture_scenario: Optional[float] = Field(None, ge=0.0, le=1.0, description="Scenario soil moisture 0.0 to 1.0")


class HazardState(BaseModel):
    flood_probability: float
    landslide_probability: float
    combined_risk: float
    risk_level: str


class DeltaState(BaseModel):
    flood_probability: float
    landslide_probability: float
    combined_risk: float
    risk_level_change: str


class SimulationResponse(BaseModel):
    scenario_id: str
    location: CoordinatesSchema
    baseline: HazardState
    scenario: HazardState
    delta: DeltaState
    model_version: str = "fusion_v1.0"
    created_at: str
