from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.schemas.common import APIResponse
from app.services.prediction_service import prediction_service

router = APIRouter(prefix="/predict", tags=["Predictions"])


@router.post("/dual", response_model=APIResponse[PredictionResponse])
async def predict_dual_hazard(
    req: PredictionRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await prediction_service.predict_dual_hazard(req, db=db)
    return APIResponse(data=result)


@router.post("/flood", response_model=APIResponse[PredictionResponse])
async def predict_flood(
    req: PredictionRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await prediction_service.predict_dual_hazard(req, db=db)
    result.hazard_type = "flood"
    return APIResponse(data=result)


@router.post("/landslide", response_model=APIResponse[PredictionResponse])
async def predict_landslide(
    req: PredictionRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await prediction_service.predict_dual_hazard(req, db=db)
    result.hazard_type = "landslide"
    return APIResponse(data=result)
