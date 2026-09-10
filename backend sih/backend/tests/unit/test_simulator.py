import pytest
from app.schemas.simulate import SimulationRequest
from app.services.simulator_service import simulator_service


@pytest.mark.asyncio
async def test_simulation_deltas():
    req = SimulationRequest(
        latitude=31.1048,
        longitude=77.1734,
        rainfall_delta_percent=50.0
    )
    res = await simulator_service.run_simulation(req)

    assert res.scenario_id.startswith("sim_")
    assert res.scenario.combined_risk >= res.baseline.combined_risk
    assert res.delta.combined_risk == round(res.scenario.combined_risk - res.baseline.combined_risk, 1)
