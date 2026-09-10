from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.dashboard import DashboardSummaryResponse
from app.schemas.common import APIResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/{location_id}", response_model=APIResponse[DashboardSummaryResponse])
async def get_dashboard_data(
    location_id: str,
    latitude: float = Query(31.1048, ge=-90.0, le=90.0),
    longitude: float = Query(77.1734, ge=-180.0, le=180.0),
    db: AsyncSession = Depends(get_db)
):
    summary = await dashboard_service.get_dashboard_summary(location_id, latitude, longitude, db=db)
    return APIResponse(data=summary)
