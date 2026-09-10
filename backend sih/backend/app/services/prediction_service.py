import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.weather_service import weather_service
from app.services.satellite_service import satellite_service
from app.services.feature_service import feature_service
from app.services.fusion_service import fusion_service
from app.services.explanation_service import explanation_service
from app.services.alert_service import alert_service
from app.integrations.ml_client.client import ml_service_client
from app.schemas.prediction import PredictionRequest, PredictionResponse, HazardBranchResult
from app.schemas.common import CoordinatesSchema
from app.db.models import Prediction, RiskFusionResult
from app.repositories.prediction_repo import PredictionRepository


class PredictionService:
    async def predict_dual_hazard(
        self,
        req: PredictionRequest,
        db: Optional[AsyncSession] = None
    ) -> PredictionResponse:
        # Step 1: Retrieve Weather & Satellite observations
        weather = await weather_service.get_weather_for_location(req.latitude, req.longitude)
        satellite = await satellite_service.get_satellite_for_location(req.latitude, req.longitude)

        # Step 2: Assemble Feature Vector
        features = feature_service.assemble_features(
            weather, satellite, req.latitude, req.longitude, req.override_features
        )

        # Step 3: Run ML Inference for Flood and Landslide in parallel
        flood_res = await ml_service_client.predict_flood(features)
        landslide_res = await ml_service_client.predict_landslide(features)

        flood_prob = flood_res["branch_probability"]
        landslide_prob = landslide_res["branch_probability"]

        # Step 4: Multi-Hazard Risk Fusion
        risk_score, risk_level, fusion_breakdown = fusion_service.compute_risk_fusion(
            flood_prob, landslide_prob, features
        )

        prediction_id = f"pred_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        # Step 5: Format Explanation
        explanation_data = explanation_service.format_shap_explanation(prediction_id, "dual", features)

        # Step 6: Construct Response
        flood_branch = HazardBranchResult(
            probability=round(flood_prob, 4),
            risk_score=round(flood_prob * 100.0, 1),
            risk_level="HIGH" if flood_prob > 0.6 else ("MODERATE" if flood_prob > 0.3 else "LOW"),
            confidence=0.88
        )
        landslide_branch = HazardBranchResult(
            probability=round(landslide_prob, 4),
            risk_score=round(landslide_prob * 100.0, 1),
            risk_level="HIGH" if landslide_prob > 0.6 else ("MODERATE" if landslide_prob > 0.3 else "LOW"),
            confidence=0.85
        )

        response = PredictionResponse(
            prediction_id=prediction_id,
            location=CoordinatesSchema(latitude=req.latitude, longitude=req.longitude),
            location_name=f"Location ({round(req.latitude, 3)}, {round(req.longitude, 3)})",
            hazard_type="dual",
            flood=flood_branch,
            landslide=landslide_branch,
            combined_risk=risk_score,
            risk_level=risk_level,
            prediction_timestamp=now,
            model_versions={
                "flood": "flood_xgb_v1.0",
                "landslide": "landslide_xgb_v1.0",
                "fusion": "fusion_v1.0"
            },
            contributing_factors=explanation_data["top_contributing_features"],
            explanation=explanation_data
        )

        # Step 7: Persist Prediction if DB session provided
        if db and req.location_id:
            try:
                repo = PredictionRepository(db)
                pred_obj = Prediction(
                    id=prediction_id,
                    location_id=req.location_id,
                    hazard_type="dual",
                    model_version="1.0.0",
                    feature_schema_version="1.0",
                    flood_probability=flood_prob,
                    landslide_probability=landslide_prob,
                    risk_score=risk_score,
                    risk_level=risk_level,
                    confidence=0.87,
                    prediction_timestamp=now,
                    feature_snapshot=features,
                    explanation=explanation_data,
                    provenance={"source": "FastAPI-Orchestrator"}
                )
                await repo.create(pred_obj)

                # Evaluate automatic alerts
                await alert_service.evaluate_and_trigger_alert(
                    hazard_type="dual",
                    risk_score=risk_score,
                    risk_level=risk_level,
                    latitude=req.latitude,
                    longitude=req.longitude,
                    prediction_id=prediction_id,
                    db=db
                )
            except Exception as e:
                pass

        return response


prediction_service = PredictionService()
