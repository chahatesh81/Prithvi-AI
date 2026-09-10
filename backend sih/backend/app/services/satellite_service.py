from app.integrations.satellite.client import satellite_client
from app.schemas.satellite import SatelliteIndicesResponse


class SatelliteService:
    async def get_satellite_for_location(self, latitude: float, longitude: float) -> SatelliteIndicesResponse:
        return await satellite_client.get_satellite_indices(latitude, longitude)


satellite_service = SatelliteService()
