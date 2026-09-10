import logging
import uuid
import math
from typing import List, Dict, Any
from app.schemas.routes import RouteItemResponse, HazardHotspot

logger = logging.getLogger("sih-backend.routing-client")


class RoutingClient:
    async def get_candidate_routes(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        travel_mode: str = "driving"
    ) -> List[RouteItemResponse]:
        # Generate 2 distinct candidate routes between origin & destination
        dist_approx = math.sqrt((dest_lat - origin_lat)**2 + (dest_lon - origin_lon)**2) * 111.0
        duration_approx = (dist_approx / 40.0) * 60.0  # minutes

        # Route 1: Direct Highway (Faster, but higher slope/landslide hazard exposure)
        route_1_geom = {
            "type": "LineString",
            "coordinates": [
                [origin_lon, origin_lat],
                [origin_lon + (dest_lon - origin_lon) * 0.5, origin_lat + (dest_lat - origin_lat) * 0.4],
                [dest_lon, dest_lat]
            ]
        }
        route_1 = RouteItemResponse(
            route_id=str(uuid.uuid4()),
            geometry_geojson=route_1_geom,
            distance_km=round(dist_approx, 1),
            estimated_duration_minutes=round(duration_approx, 0),
            flood_exposure=42.0,
            landslide_exposure=68.0,
            combined_risk=58.0,
            risk_level="HIGH",
            risk_tier_description="Higher Modeled Hazard Exposure (Steep Slope Corridor)",
            rank=2,
            hotspots=[
                HazardHotspot(
                    latitude=origin_lat + (dest_lat - origin_lat) * 0.4,
                    longitude=origin_lon + (dest_lon - origin_lon) * 0.5,
                    hazard_type="landslide",
                    risk_score=75.0,
                    description="Steep slope section vulnerable to debris flow during heavy rainfall"
                )
            ]
        )

        # Route 2: Valley Bypass (Slightly longer, but lower landslide hazard exposure)
        offset_lon = 0.05
        route_2_geom = {
            "type": "LineString",
            "coordinates": [
                [origin_lon, origin_lat],
                [origin_lon + (dest_lon - origin_lon) * 0.3 + offset_lon, origin_lat + (dest_lat - origin_lat) * 0.3],
                [origin_lon + (dest_lon - origin_lon) * 0.7 + offset_lon, origin_lat + (dest_lat - origin_lat) * 0.7],
                [dest_lon, dest_lat]
            ]
        }
        route_2 = RouteItemResponse(
            route_id=str(uuid.uuid4()),
            geometry_geojson=route_2_geom,
            distance_km=round(dist_approx * 1.15, 1),
            estimated_duration_minutes=round(duration_approx * 1.1, 0),
            flood_exposure=22.0,
            landslide_exposure=18.0,
            combined_risk=20.0,
            risk_level="LOW",
            risk_tier_description="Lower Modeled Hazard Exposure (Recommended Alternative)",
            rank=1,
            hotspots=[]
        )

        return [route_2, route_1]


routing_client = RoutingClient()
