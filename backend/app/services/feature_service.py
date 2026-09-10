from typing import Dict, Any, Optional
from app.schemas.weather import WeatherObservationResponse
from app.schemas.satellite import SatelliteIndicesResponse


class FeatureService:
    def assemble_features(
        self,
        weather: WeatherObservationResponse,
        satellite: SatelliteIndicesResponse,
        latitude: float,
        longitude: float,
        overrides: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        # Terrain features calculated based on coordinates or defaults for region
        elevation = 750.0 if latitude > 30.0 else 350.0
        slope = 28.5 if latitude > 30.0 else 12.0
        aspect = 180.0
        curvature = 0.05
        tpi = 12.0
        tri = 22.5

        features = {
            "latitude": latitude,
            "longitude": longitude,
            "rainfall_1h": weather.rainfall_1h,
            "rainfall_24h": weather.rainfall_24h,
            "rainfall_3d": weather.rainfall_3d,
            "rainfall_7d": weather.rainfall_7d,
            "rainfall_intensity": weather.rainfall_intensity,
            "temperature": weather.temperature or 20.0,
            "humidity": weather.humidity or 75.0,
            "soil_moisture": weather.soil_moisture or 0.5,
            "elevation": elevation,
            "slope": slope,
            "aspect": aspect,
            "curvature": curvature,
            "tpi": tpi,
            "tri": tri,
            "ndvi": satellite.ndvi or 0.6,
            "ndwi": satellite.ndwi or 0.3,
            "vegetation_change": satellite.vegetation_change or 0.0,
            "water_change": satellite.water_change or 0.0
        }

        if overrides:
            features.update(overrides)

        return features


feature_service = FeatureService()
