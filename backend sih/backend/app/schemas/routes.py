from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.common import CoordinatesSchema


class RouteRequest(BaseModel):
    origin: CoordinatesSchema
    destination: CoordinatesSchema
    travel_mode: str = Field("driving", description="Mode of travel: driving, walking, transit")
    risk_preference: str = Field("safer", description="Routing preference: safer, fastest, shortest")


class HazardHotspot(BaseModel):
    latitude: float
    longitude: float
    hazard_type: str  # flood, landslide
    risk_score: float
    description: str


class RouteItemResponse(BaseModel):
    route_id: str
    geometry_geojson: Dict[str, Any]
    distance_km: float
    estimated_duration_minutes: float
    flood_exposure: float = Field(..., ge=0.0, le=100.0)
    landslide_exposure: float = Field(..., ge=0.0, le=100.0)
    combined_risk: float = Field(..., ge=0.0, le=100.0)
    risk_level: str  # LOW, MODERATE, HIGH, VERY_HIGH, CRITICAL
    risk_tier_description: str  # e.g., Lower Modeled Hazard Exposure
    rank: int
    hotspots: List[HazardHotspot] = []


class RouteAlternativeResponse(BaseModel):
    origin: CoordinatesSchema
    destination: CoordinatesSchema
    recommended_route_id: str
    candidate_routes: List[RouteItemResponse]
