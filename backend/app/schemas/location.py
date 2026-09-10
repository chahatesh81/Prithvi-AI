from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.common import CoordinatesSchema


class LocationCreate(CoordinatesSchema):
    name: str = Field(..., min_length=2, max_length=255)
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    tehsil: Optional[str] = None
    village: Optional[str] = None
    administrative_context: Optional[Dict[str, Any]] = None


class LocationResponse(LocationCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str

