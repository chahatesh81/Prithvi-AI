from fastapi import APIRouter
from app.schemas.simulate import SimulationRequest, SimulationResponse
from app.schemas.common import APIResponse
from app.services.simulator_service import simulator_service

router = APIRouter(prefix="/simulate", tags=["Simulator"])


@router.post("", response_model=APIResponse[SimulationResponse])
async def run_simulation(req: SimulationRequest):
    result = await simulator_service.run_simulation(req)
    return APIResponse(data=result)
