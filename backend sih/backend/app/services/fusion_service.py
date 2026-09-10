from typing import Dict, Any, Tuple


class FusionService:
    def __init__(self):
        # Default configurable risk fusion weights
        self.weights = {
            "w_flood": 0.35,
            "w_landslide": 0.45,
            "w_rule": 0.10,
            "w_env": 0.10
        }

    def compute_risk_fusion(
        self,
        flood_prob: float,
        landslide_prob: float,
        features: Dict[str, Any]
    ) -> Tuple[float, str, Dict[str, Any]]:
        # Rule score calculation from environmental thresholds
        rainfall_24h = features.get("rainfall_24h", 0.0)
        slope = features.get("slope", 0.0)
        soil_moisture = features.get("soil_moisture", 0.0)

        rule_score = 0.0
        if rainfall_24h > 100.0:
            rule_score += 0.4
        elif rainfall_24h > 50.0:
            rule_score += 0.2

        if slope > 25.0:
            rule_score += 0.4
        elif slope > 15.0:
            rule_score += 0.2

        if soil_moisture > 0.6:
            rule_score += 0.2

        rule_score = min(rule_score, 1.0)
        env_score = min((rainfall_24h / 200.0) * (soil_moisture / 0.8), 1.0)

        # Multi-Hazard Fusion Formula
        final_probability = (
            self.weights["w_flood"] * flood_prob +
            self.weights["w_landslide"] * landslide_prob +
            self.weights["w_rule"] * rule_score +
            self.weights["w_env"] * env_score
        )

        risk_score = round(min(max(final_probability * 100.0, 0.0), 100.0), 1)

        # Risk Level thresholds as defined by project specification
        if risk_score >= 80.0:
            risk_level = "CRITICAL"
        elif risk_score >= 65.0:
            risk_level = "VERY_HIGH"
        elif risk_score >= 45.0:
            risk_level = "HIGH"
        elif risk_score >= 25.0:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        fusion_breakdown = {
            "flood_prob": flood_prob,
            "landslide_prob": landslide_prob,
            "rule_score": round(rule_score, 4),
            "env_score": round(env_score, 4),
            "weights": self.weights,
            "final_score": risk_score,
            "risk_level": risk_level,
            "fusion_model_version": "fusion_v1.0"
        }

        return risk_score, risk_level, fusion_breakdown


fusion_service = FusionService()
