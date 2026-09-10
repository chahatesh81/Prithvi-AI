from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.models import Prediction
from app.repositories.base import BaseRepository


class PredictionRepository(BaseRepository[Prediction]):
    def __init__(self, session: AsyncSession):
        super().__init__(Prediction, session)

    async def get_latest_by_location(self, location_id: str, hazard_type: Optional[str] = None) -> Optional[Prediction]:
        stmt = select(Prediction).where(Prediction.location_id == location_id)
        if hazard_type:
            stmt = stmt.where(Prediction.hazard_type == hazard_type)
        stmt = stmt.order_by(desc(Prediction.prediction_timestamp)).limit(1)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_history_by_location(self, location_id: str, limit: int = 30) -> List[Prediction]:
        stmt = select(Prediction).where(Prediction.location_id == location_id)\
            .order_by(desc(Prediction.prediction_timestamp)).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
