import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.services.weather_service import weather_service
from app.services.satellite_service import satellite_service
from app.services.feature_service import feature_service
from app.services.fusion_service import fusion_service
from app.integrations.ml_client.client import ml_service_client
from app.schemas.simulate import SimulationRequest, SimulationResponse, HazardState, DeltaState
from app.schemas.common import CoordinatesSchema


class SimulatorService:
    async def run_simulation(self, req: SimulationRequest) -> SimulationResponse:
        # Step 1: Retrieve current baseline environmental data
        weather = await weather_service.get_weather_for_location(req.latitude, req.longitude)
        satellite = await satellite_service.get_satellite_for_location(req.latitude, req.longitude)

        # Step 2: Construct Baseline Feature Vector
        baseline_features = feature_service.assemble_features(weather, satellite, req.latitude, req.longitude)

        # Baseline ML inference
        b_flood_res = await ml_service_client.predict_flood(baseline_features)
        b_landslide_res = await ml_service_client.predict_landslide(baseline_features)
        b_flood_prob = b_flood_res["branch_probability"]
        b_landslide_prob = b_landslide_res["branch_probability"]

        b_score, b_level, _ = fusion_service.compute_risk_fusion(b_flood_prob, b_landslide_prob, baseline_features)

        baseline_state = HazardState(
            flood_probability=round(b_flood_prob, 4),
            landslide_probability=round(b_landslide_prob, 4),
            combined_risk=b_score,
            risk_level=b_level
        )

        # Step 3: Construct Scenario Modifications (Without modifying real data)
        scenario_features = dict(baseline_features)
        
        # Apply rainfall percentage modifier
        r_current = baseline_features.get("rainfall_24h", 50.0)
        scenario_r24 = max(0.0, r_current * (1.0 + (req.rainfall_delta_percent / 100.0)))
        scenario_features["rainfall_24h"] = scenario_r24

        if req.rainfall_intensity_mm_hr is not None:
            scenario_features["rainfall_intensity"] = req.rainfall_intensity_mm_hr

        if req.soil_moisture_scenario is not None:
            scenario_features["soil_moisture"] = req.soil_moisture_scenario

        # Step 4: Scenario ML inference
        s_flood_res = await ml_service_client.predict_flood(scenario_features)
        s_landslide_res = await ml_service_client.predict_landslide(scenario_features)
        s_flood_prob = s_flood_res["branch_probability"]
        s_landslide_prob = s_landslide_res["branch_probability"]

        s_score, s_level, _ = fusion_service.compute_risk_fusion(s_flood_prob, s_landslide_prob, scenario_features)

        scenario_state = HazardState(
            flood_probability=round(s_flood_prob, 4),
            landslide_probability=round(s_landslide_prob, 4),
            combined_risk=s_score,
            risk_level=s_level
        )

        # Step 5: Compute Deltas
        f_delta = round(s_flood_prob - b_flood_prob, 4)
        l_delta = round(s_landslide_prob - b_landslide_prob, 4)
        r_delta = round(s_score - b_score, 1)

        level_change = f"Stable ({b_level})" if b_level == s_level else f"Risk Escalation: {b_level} -> {s_level}"

        delta_state = DeltaState(
            flood_probability=f_delta,
            landslide_probability=l_delta,
            combined_risk=r_delta,
            risk_level_change=level_change
        )

        scenario_id = f"sim_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()

        return SimulationResponse(
            scenario_id=scenario_id,
            location=CoordinatesSchema(latitude=req.latitude, longitude=req.longitude),
            baseline=baseline_state,
            scenario=scenario_state,
            delta=delta_state,
            model_version="fusion_v1.0",
            created_at=now
        )


simulator_service = SimulatorService()
