from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.common import APIResponse, PaginationMeta
from app.repositories.prediction_repo import PredictionRepository

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=APIResponse[List[Dict[str, Any]]])
async def get_prediction_history(
    location_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    history_items = []
    if location_id:
        repo = PredictionRepository(db)
        items = await repo.get_history_by_location(location_id, limit=page_size)
        history_items = [
            {
                "prediction_id": i.id,
                "location_id": i.location_id,
                "hazard_type": i.hazard_type,
                "risk_score": i.risk_score,
                "risk_level": i.risk_level,
                "timestamp": i.prediction_timestamp
            }
            for i in items
        ]

    meta = PaginationMeta(
        total=len(history_items),
        page=page,
        page_size=page_size,
        pages=1
    )
    return APIResponse(data=history_items, meta=meta.model_dump())
