import pytest
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_analyze_missing_fields(client):
    resp = await client.post("/api/analyze", json={})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_analyze_invalid_date_range(client):
    resp = await client.post("/api/analyze", json={
        "search_tag": "crypto tax",
        "start_date": "2024-03-01",
        "end_date": "2024-01-01",
        "platforms": ["youtube"],
        "max_videos": 5,
    })
    assert resp.status_code == 400
    assert "start_date" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_analyze_returns_run_id(client):
    with patch("main._run_pipeline", new_callable=AsyncMock):
        resp = await client.post("/api/analyze", json={
            "search_tag": "crypto tax india",
            "start_date": "2024-01-01",
            "end_date": "2024-03-31",
            "platforms": ["youtube"],
            "max_videos": 5,
        })
    assert resp.status_code == 200
    body = resp.json()
    assert "run_id" in body
    assert body["status"] == "pending"


@pytest.mark.asyncio
async def test_results_invalid_id(client):
    resp = await client.get("/api/results/not-a-valid-objectid")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_results_not_found(client):
    resp = await client.get("/api/results/507f1f77bcf86cd799439011")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_history_returns_list(client):
    resp = await client.get("/api/history")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
