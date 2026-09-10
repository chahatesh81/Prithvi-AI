from fastapi import APIRouter
from app.schemas.routes import RouteRequest, RouteAlternativeResponse
from app.schemas.common import APIResponse
from app.services.route_service import route_service

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.post("/alternative", response_model=APIResponse[RouteAlternativeResponse])
async def get_alternative_routes(req: RouteRequest):
    res = await route_service.analyze_route_risk(req)
    return APIResponse(data=res)
