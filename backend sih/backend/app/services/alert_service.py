import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Alert
from app.repositories.alert_repo import AlertRepository
from app.schemas.alert import AlertResponse

logger = logging.getLogger("sih-backend.alert-service")


class AlertService:
    def generate_fingerprint(self, hazard_type: str, severity: str, lat: float, lon: float) -> str:
        raw = f"{hazard_type}:{severity}:{round(lat, 2)}:{round(lon, 2)}"
        return hashlib.md5(raw.encode("utf-8")).hexdigest()

    async def evaluate_and_trigger_alert(
        self,
        hazard_type: str,
        risk_score: float,
        risk_level: str,
        latitude: float,
        longitude: float,
        prediction_id: Optional[str] = None,
        db: Optional[AsyncSession] = None
    ) -> Optional[AlertResponse]:
        if risk_score < 45.0:
            return None  # Only generate alerts for HIGH, VERY_HIGH, CRITICAL risk

        fingerprint = self.generate_fingerprint(hazard_type, risk_level, latitude, longitude)
        now = datetime.now(timezone.utc)
        message = f"Warning: {risk_level} {hazard_type.upper()} risk detected at coordinates ({round(latitude, 4)}, {round(longitude, 4)}). Risk score: {risk_score}/100."

        if db:
            repo = AlertRepository(db)
            existing = await repo.get_by_fingerprint(fingerprint)
            if existing:
                return AlertResponse.model_validate(existing)

            alert_obj = Alert(
                prediction_id=prediction_id,
                hazard_type=hazard_type,
                severity=risk_level,
                status="ACTIVE",
                message=message,
                latitude=latitude,
                longitude=longitude,
                fingerprint=fingerprint,
                generated_at=now,
                expires_at=now + timedelta(hours=24)
            )
            created = await repo.create(alert_obj)
            return AlertResponse.model_validate(created)

        # Fallback return when DB is not provided
        return AlertResponse(
            id="alert_demo_1",
            prediction_id=prediction_id,
            hazard_type=hazard_type,
            severity=risk_level,
            status="ACTIVE",
            message=message,
            latitude=latitude,
            longitude=longitude,
            fingerprint=fingerprint,
            generated_at=now,
            expires_at=now + timedelta(hours=24)
        )


alert_service = AlertService()
