from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.alert import AlertCreate, AlertResponse
from app.schemas.common import APIResponse
from app.services.alert_service import alert_service
from app.repositories.alert_repo import AlertRepository
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=APIResponse[List[AlertResponse]])
async def list_active_alerts(db: AsyncSession = Depends(get_db)):
    repo = AlertRepository(db)
    alerts = await repo.get_active_alerts()
    if not alerts:
        # Fallback sample active alert for initial setup
        sample = await alert_service.evaluate_and_trigger_alert(
            hazard_type="landslide",
            risk_score=78.5,
            risk_level="HIGH",
            latitude=31.1048,
            longitude=77.1734
        )
        return APIResponse(data=[sample] if sample else [])
    return APIResponse(data=[AlertResponse.model_validate(a) for a in alerts])


@router.post("", response_model=APIResponse[AlertResponse], status_code=201)
async def create_alert(alert_in: AlertCreate, db: AsyncSession = Depends(get_db)):
    res = await alert_service.evaluate_and_trigger_alert(
        hazard_type=alert_in.hazard_type,
        risk_score=85.0,
        risk_level=alert_in.severity,
        latitude=alert_in.latitude,
        longitude=alert_in.longitude,
        prediction_id=alert_in.prediction_id,
        db=db
    )
    return APIResponse(data=res)


@router.post("/{alert_id}/acknowledge", response_model=APIResponse[AlertResponse])
async def acknowledge_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    repo = AlertRepository(db)
    alert = await repo.get_by_id(alert_id)
    if not alert:
        raise NotFoundException("Alert")
    alert.status = "ACKNOWLEDGED"
    await db.commit()
    await db.refresh(alert)
    return APIResponse(data=AlertResponse.model_validate(alert))
