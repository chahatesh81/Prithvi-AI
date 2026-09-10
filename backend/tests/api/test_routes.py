def test_alternative_routes_api(client):
    payload = {
        "origin": {"latitude": 31.1048, "longitude": 77.1734},
        "destination": {"latitude": 31.2500, "longitude": 77.3000},
        "travel_mode": "driving",
        "risk_preference": "safer"
    }
    res = client.post("/api/v1/routes/alternative", json=payload)
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert "recommended_route_id" in data
    assert len(data["candidate_routes"]) >= 2
    assert data["candidate_routes"][0]["rank"] == 1
