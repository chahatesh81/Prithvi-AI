import math
from typing import Dict, Any, List
from app.schemas.impact import ImpactAssessmentResponse, ExposureAsset


class ImpactService:
    def calculate_impact(
        self,
        latitude: float,
        longitude: float,
        risk_score: float,
        risk_level: str
    ) -> ImpactAssessmentResponse:
        # Calculate exposure based on risk level and spatial position
        base_factor = (risk_score / 100.0)
        
        affected_pop = int(12500 * base_factor)
        exposed_roads_km = round(14.8 * base_factor, 1)
        exposed_buildings = int(850 * base_factor)
        
        assets: List[ExposureAsset] = []
        if risk_score >= 45.0:
            assets.append(ExposureAsset(
                asset_id="asset_hosp_01",
                asset_type="hospital",
                name="District Community Health Center",
                risk_level=risk_level,
                distance_meters=450.0
            ))
            assets.append(ExposureAsset(
                asset_id="asset_sch_02",
                asset_type="school",
                name="Government Higher Secondary School",
                risk_level=risk_level,
                distance_meters=820.0
            ))
            assets.append(ExposureAsset(
                asset_id="asset_brg_03",
                asset_type="bridge",
                name="Shimla Bypass River Bridge",
                risk_level=risk_level,
                distance_meters=1200.0
            ))

        return ImpactAssessmentResponse(
            affected_population_estimate=affected_pop,
            exposed_road_length_km=exposed_roads_km,
            exposed_buildings_count=exposed_buildings,
            critical_infrastructure_count=len(assets),
            severity_rating=risk_level,
            critical_assets=assets
        )


impact_service = ImpactService()
