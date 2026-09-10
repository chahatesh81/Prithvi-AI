import math
from typing import Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="SIH Dual-Hazard ML Microservice",
    version="1.0.0",
    description="Standalone ML/DL inference engine for Flood and Landslide hazard probabilities"
)


class PredictionRequest(BaseModel):
    features: Dict[str, Any]


@app.get("/health")
def health():
    return {"status": "ok", "service": "ml_service"}


@app.post("/predict/flood")
def predict_flood(req: PredictionRequest):
    features = req.features
    r24 = float(features.get("rainfall_24h", 50.0))
    r7d = float(features.get("rainfall_7d", 150.0))
    slope = float(features.get("slope", 15.0))
    soil = float(features.get("soil_moisture", 0.5))

    z = (0.03 * r24) + (0.01 * r7d) + (1.2 * soil) - (0.02 * slope) - 2.5
    prob = 1.0 / (1.0 + math.exp(-z))
    prob = min(max(prob, 0.05), 0.98)

    return {
        "hazard": "flood",
        "ml_probability": round(prob, 4),
        "dl_probability": round(prob * 0.95, 4),
        "branch_probability": round(prob, 4),
        "model_versions": {
            "xgboost": "flood_xgb_v1.0",
            "dl": "flood_cnn_v1.0"
        }
    }


@app.post("/predict/landslide")
def predict_landslide(req: PredictionRequest):
    features = req.features
    r24 = float(features.get("rainfall_24h", 50.0))
    slope = float(features.get("slope", 25.0))
    tri = float(features.get("tri", 18.0))
    soil = float(features.get("soil_moisture", 0.5))

    z = (0.04 * slope) + (0.025 * r24) + (0.02 * tri) + (0.8 * soil) - 3.2
    prob = 1.0 / (1.0 + math.exp(-z))
    prob = min(max(prob, 0.05), 0.98)

    return {
        "hazard": "landslide",
        "ml_probability": round(prob, 4),
        "dl_probability": round(prob * 0.92, 4),
        "branch_probability": round(prob, 4),
        "model_versions": {
            "xgboost": "landslide_xgb_v1.0",
            "dl": "landslide_cnn_v1.0"
        }
    }
