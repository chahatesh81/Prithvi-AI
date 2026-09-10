def test_health_endpoints(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    json_data = res.json()
    assert json_data["success"] is True
    assert json_data["data"]["status"] == "healthy"

    res_live = client.get("/api/v1/health/live")
    assert res_live.status_code == 200
    assert res_live.json()["data"]["status"] == "live"

    res_ready = client.get("/api/v1/health/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["data"]["status"] == "ready"
