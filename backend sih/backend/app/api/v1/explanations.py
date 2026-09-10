from typing import Dict, Any
from fastapi import APIRouter
from app.schemas.common import APIResponse
from app.services.explanation_service import explanation_service

router = APIRouter(prefix="/explanations", tags=["Explanations"])


@router.get("/{prediction_id}", response_model=APIResponse[Dict[str, Any]])
async def get_prediction_explanation(prediction_id: str):
    features = {"rainfall_24h": 68.5, "slope": 28.5, "soil_moisture": 0.68}
    explanation = explanation_service.format_shap_explanation(prediction_id, "dual", features)
    return APIResponse(data=explanation)
