def test_simulate_api(client):
    payload = {
        "latitude": 31.1048,
        "longitude": 77.1734,
        "rainfall_delta_percent": 25.0
    }
    res = client.post("/api/v1/simulate", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert "scenario_id" in data
    assert "baseline" in data
    assert "scenario" in data
    assert "delta" in data
    assert data["scenario"]["combined_risk"] >= data["baseline"]["combined_risk"]
