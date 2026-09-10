from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.weather_service import weather_service
from app.services.prediction_service import prediction_service
from app.services.impact_service import impact_service
from app.schemas.prediction import PredictionRequest
from app.schemas.dashboard import DashboardSummaryResponse
from app.schemas.common import CoordinatesSchema


class DashboardService:
    async def get_dashboard_summary(
        self,
        location_id: str,
        latitude: float,
        longitude: float,
        db: Optional[AsyncSession] = None
    ) -> DashboardSummaryResponse:
        weather = await weather_service.get_weather_for_location(latitude, longitude)
        
        pred_req = PredictionRequest(latitude=latitude, longitude=longitude, location_id=location_id)
        prediction = await prediction_service.predict_dual_hazard(pred_req, db=db)

        impact = impact_service.calculate_impact(
            latitude, longitude, prediction.combined_risk, prediction.risk_level
        )

        now = datetime.now(timezone.utc)

        return DashboardSummaryResponse(
            location_id=location_id,
            location_name=prediction.location_name or "Monitored Region",
            coordinates=CoordinatesSchema(latitude=latitude, longitude=longitude),
            current_weather=weather,
            latest_prediction=prediction,
            impact_assessment=impact,
            active_alerts=[],
            risk_trend="INCREASING" if weather.rainfall_24h > 50 else "STABLE",
            timestamp=now
        )


dashboard_service = DashboardService()
