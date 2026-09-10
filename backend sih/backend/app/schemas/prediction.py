from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.schemas.common import CoordinatesSchema


class PredictionRequest(CoordinatesSchema):
    location_id: Optional[str] = None
    override_features: Optional[Dict[str, Any]] = None


class HazardBranchResult(BaseModel):
    probability: float = Field(..., ge=0.0, le=1.0)
    risk_score: float = Field(..., ge=0.0, le=100.0)
    risk_level: str  # LOW, MODERATE, HIGH, VERY_HIGH, CRITICAL
    confidence: float = Field(0.85, ge=0.0, le=1.0)


class PredictionResponse(BaseModel):
    prediction_id: str
    location: CoordinatesSchema
    location_name: Optional[str] = "Selected Location"
    hazard_type: str  # flood, landslide, dual
    flood: Optional[HazardBranchResult] = None
    landslide: Optional[HazardBranchResult] = None
    combined_risk: float = Field(..., ge=0.0, le=100.0)
    risk_level: str
    prediction_timestamp: datetime
    model_versions: Dict[str, str]
    contributing_factors: List[Dict[str, Any]] = []
    explanation: Optional[Dict[str, Any]] = None
