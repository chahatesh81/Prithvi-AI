from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.common import CoordinatesSchema


class AlertCreate(CoordinatesSchema):
    hazard_type: str
    severity: str  # LOW, MODERATE, HIGH, VERY_HIGH, CRITICAL
    message: str
    prediction_id: Optional[str] = None
    location_id: Optional[str] = None
    expires_at: Optional[datetime] = None


class AlertResponse(AlertCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str  # ACTIVE, ACKNOWLEDGED, RESOLVED
    generated_at: datetime
    fingerprint: str

