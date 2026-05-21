import pytest

ASSET = {
    "name": "User Auth Service",
    "asset_type": "service",
    "migration_strategy": "replatform",
    "current_host": "on-prem-01",
    "target_host": "aws-eks-prod",
    "risk_level": "medium",
}


@pytest.mark.asyncio
async def test_list_assets_empty(client):
    r = await client.get("/api/v1/assets")
    assert r.status_code == 200
    assert r.json()["items"] == []
    assert r.json()["total"] == 0


@pytest.mark.asyncio
async def test_create_asset(client):
    r = await client.post("/api/v1/assets", json=ASSET)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == ASSET["name"]
    assert data["status"] == "pending"
    assert data["containerization_plan"] is None


@pytest.mark.asyncio
async def test_get_asset(client):
    created = (await client.post("/api/v1/assets", json=ASSET)).json()
    r = await client.get(f"/api/v1/assets/{created['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == created["id"]


@pytest.mark.asyncio
async def test_update_asset(client):
    created = (await client.post("/api/v1/assets", json=ASSET)).json()
    r = await client.put(f"/api/v1/assets/{created['id']}", json={
        "status": "in-progress",
        "effort_estimate_days": 14,
    })
    assert r.status_code == 200
    assert r.json()["status"] == "in-progress"
    assert r.json()["effort_estimate_days"] == 14


@pytest.mark.asyncio
async def test_delete_asset(client):
    created = (await client.post("/api/v1/assets", json=ASSET)).json()
    r = await client.delete(f"/api/v1/assets/{created['id']}")
    assert r.status_code == 204


@pytest.mark.asyncio
async def test_asset_not_found(client):
    r = await client.get("/api/v1/assets/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
