from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.models import Alert
from app.repositories.base import BaseRepository


class AlertRepository(BaseRepository[Alert]):
    def __init__(self, session: AsyncSession):
        super().__init__(Alert, session)

    async def get_active_alerts(self, limit: int = 50) -> List[Alert]:
        stmt = select(Alert).where(Alert.status == "ACTIVE").order_by(desc(Alert.generated_at)).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_fingerprint(self, fingerprint: str) -> Optional[Alert]:
        stmt = select(Alert).where(Alert.fingerprint == fingerprint, Alert.status == "ACTIVE")
        result = await self.session.execute(stmt)
        return result.scalars().first()
