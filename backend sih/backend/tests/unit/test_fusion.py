from app.services.fusion_service import fusion_service


def test_risk_fusion_level_classification():
    features = {"rainfall_24h": 120.0, "slope": 30.0, "soil_moisture": 0.7}
    score, level, breakdown = fusion_service.compute_risk_fusion(0.85, 0.90, features)

    assert 0.0 <= score <= 100.0
    assert level in ["LOW", "MODERATE", "HIGH", "VERY_HIGH", "CRITICAL"]
    assert breakdown["final_score"] == score
    assert sum(fusion_service.weights.values()) == 1.0


def test_risk_fusion_low_inputs():
    features = {"rainfall_24h": 5.0, "slope": 5.0, "soil_moisture": 0.2}
    score, level, breakdown = fusion_service.compute_risk_fusion(0.10, 0.15, features)

    assert score < 30.0
    assert level in ["LOW", "MODERATE"]
