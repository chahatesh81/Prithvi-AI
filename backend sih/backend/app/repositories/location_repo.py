from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from app.db.models import Location
from app.repositories.base import BaseRepository


class LocationRepository(BaseRepository[Location]):
    def __init__(self, session: AsyncSession):
        super().__init__(Location, session)

    async def search(self, query: str, limit: int = 20) -> List[Location]:
        pattern = f"%{query}%"
        stmt = select(Location).where(
            or_(
                Location.name.ilike(pattern),
                Location.state.ilike(pattern),
                Location.district.ilike(pattern),
                Location.tehsil.ilike(pattern)
            )
        ).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_by_coordinates(self, lat: float, lon: float, tolerance: float = 0.05) -> Optional[Location]:
        stmt = select(Location).where(
            func.abs(Location.latitude - lat) <= tolerance,
            func.abs(Location.longitude - lon) <= tolerance
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
