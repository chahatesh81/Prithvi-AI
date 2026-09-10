def test_dual_prediction_api(client):
    payload = {
        "latitude": 31.1048,
        "longitude": 77.1734
    }
    res = client.post("/api/v1/predict/dual", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert "prediction_id" in data
    assert "flood" in data
    assert "landslide" in data
    assert "combined_risk" in data
    assert "risk_level" in data
    assert 0.0 <= data["combined_risk"] <= 100.0
