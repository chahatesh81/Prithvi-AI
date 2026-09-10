from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.models import Location
from app.repositories.location_repo import LocationRepository
from app.schemas.location import LocationCreate, LocationResponse
from app.schemas.common import APIResponse
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", response_model=APIResponse[List[LocationResponse]])
async def list_locations(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    repo = LocationRepository(db)
    items = await repo.list_all(limit=limit, offset=offset)
    return APIResponse(data=[LocationResponse.model_validate(i) for i in items])


@router.post("", response_model=APIResponse[LocationResponse], status_code=201)
async def create_location(loc_in: LocationCreate, db: AsyncSession = Depends(get_db)):
    repo = LocationRepository(db)
    loc_obj = Location(
        name=loc_in.name,
        state=loc_in.state,
        district=loc_in.district,
        tehsil=loc_in.tehsil,
        village=loc_in.village,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        administrative_context=loc_in.administrative_context
    )
    created = await repo.create(loc_obj)
    return APIResponse(data=LocationResponse.model_validate(created))


@router.get("/search", response_model=APIResponse[List[LocationResponse]])
async def search_locations(q: str = Query(..., min_length=2), db: AsyncSession = Depends(get_db)):
    repo = LocationRepository(db)
    items = await repo.search(query=q)
    return APIResponse(data=[LocationResponse.model_validate(i) for i in items])


@router.get("/{location_id}", response_model=APIResponse[LocationResponse])
async def get_location(location_id: str, db: AsyncSession = Depends(get_db)):
    repo = LocationRepository(db)
    item = await repo.get_by_id(location_id)
    if not item:
        raise NotFoundException("Location")
    return APIResponse(data=LocationResponse.model_validate(item))
