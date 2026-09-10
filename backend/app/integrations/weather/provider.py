import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.schemas.weather import WeatherObservationResponse

logger = logging.getLogger("sih-backend.weather-provider")


class WeatherProvider:
    def __init__(self):
        self.base_url = settings.WEATHER_API_BASE_URL

    async def get_current_weather(self, latitude: float, longitude: float) -> WeatherObservationResponse:
        now = datetime.now(timezone.utc)
        try:
            url = f"{self.base_url}/forecast"
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": ["temperature_2m", "relative_humidity_2m", "rain", "wind_speed_10m"],
                "hourly": ["rain", "soil_moisture_0_to_7cm"],
                "forecast_days": 7
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    current = data.get("current", {})
                    hourly = data.get("hourly", {})
                    rain_list = hourly.get("rain", [0.0])
                    
                    r1h = current.get("rain", 0.0) or 0.0
                    r24h = sum(rain_list[:24]) if len(rain_list) >= 24 else sum(rain_list)
                    r3d = sum(rain_list[:72]) if len(rain_list) >= 72 else r24h * 2.5
                    r7d = sum(rain_list[:168]) if len(rain_list) >= 168 else r3d * 2.0
                    
                    return WeatherObservationResponse(
                        temperature=current.get("temperature_2m", 22.0),
                        humidity=current.get("relative_humidity_2m", 78.0),
                        rainfall_1h=round(r1h, 2),
                        rainfall_24h=round(r24h, 2),
                        rainfall_3d=round(r3d, 2),
                        rainfall_7d=round(r7d, 2),
                        rainfall_intensity=round(r1h, 2),
                        wind_speed=current.get("wind_speed_10m", 12.0),
                        soil_moisture=0.35,
                        observation_time=now,
                        retrieved_at=now,
                        source="OpenMeteo-Live",
                        data_mode="LIVE"
                    )
        except Exception as e:
            logger.warning(f"Failed to fetch live weather from OpenMeteo: {e}. Falling back to demo fixture.")

        # Fallback / Demo mode return
        return WeatherObservationResponse(
            temperature=21.5,
            humidity=82.0,
            rainfall_1h=12.4,
            rainfall_24h=68.5,
            rainfall_3d=145.2,
            rainfall_7d=280.0,
            rainfall_intensity=12.4,
            wind_speed=14.5,
            soil_moisture=0.68,
            observation_time=now,
            retrieved_at=now,
            source="OpenMeteo-DemoFallback",
            data_mode="DEMO"
        )


weather_provider = WeatherProvider()
