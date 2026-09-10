import logging
from app.integrations.weather.provider import weather_provider
from app.schemas.weather import WeatherObservationResponse
from app.core.cache import cache_manager
from app.core.config import settings

logger = logging.getLogger("sih-backend.weather-service")


class WeatherService:
    async def get_weather_for_location(self, latitude: float, longitude: float) -> WeatherObservationResponse:
        cache_key = f"weather:{round(latitude, 3)}:{round(longitude, 3)}"
        cached = await cache_manager.get(cache_key)
        if cached:
            return WeatherObservationResponse(**cached)

        obs = await weather_provider.get_current_weather(latitude, longitude)
        await cache_manager.set(cache_key, obs.model_dump(mode="json"), ttl_seconds=settings.CACHE_TTL_WEATHER)
        return obs


weather_service = WeatherService()
