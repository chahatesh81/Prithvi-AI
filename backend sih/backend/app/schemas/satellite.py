from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class SatelliteIndicesResponse(BaseModel):
    ndvi: Optional[float] = Field(None, ge=-1.0, le=1.0, description="Normalized Difference Vegetation Index")
    ndwi: Optional[float] = Field(None, ge=-1.0, le=1.0, description="Normalized Difference Water Index")
    vegetation_change: Optional[float] = Field(None, description="Vegetation change score")
    water_change: Optional[float] = Field(None, description="Water area change score")
    land_cover_class: str = "Forest/Hilly"
    cloud_cover_percent: float = 5.0
    observation_time: datetime
    source: str = "Sentinel-2"
    processing_status: str = "COMPLETED"
