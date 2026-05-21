import pytest

WAVE = {"name": "Wave 1 — Core Databases", "sequence_order": 1, "risk_level": "high"}
JOB = {"name": "Migrate Users DB", "migration_type": "full_load"}


@pytest.mark.asyncio
async def test_list_waves_empty(client):
    r = await client.get("/api/v1/waves")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_create_wave(client):
    r = await client.post("/api/v1/waves", json=WAVE)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == WAVE["name"]
    assert data["status"] == "planned"
    assert data["jobs"] == []


@pytest.mark.asyncio
async def test_list_waves_ordered(client):
    await client.post("/api/v1/waves", json={"name": "Wave 3", "sequence_order": 3})
    await client.post("/api/v1/waves", json={"name": "Wave 1", "sequence_order": 1})
    await client.post("/api/v1/waves", json={"name": "Wave 2", "sequence_order": 2})
    waves = (await client.get("/api/v1/waves")).json()
    assert [w["name"] for w in waves] == ["Wave 1", "Wave 2", "Wave 3"]


@pytest.mark.asyncio
async def test_update_wave(client):
    wave = (await client.post("/api/v1/waves", json=WAVE)).json()
    r = await client.put(f"/api/v1/waves/{wave['id']}", json={"status": "in-progress"})
    assert r.status_code == 200
    assert r.json()["status"] == "in-progress"


@pytest.mark.asyncio
async def test_assign_job_to_wave(client):
    wave = (await client.post("/api/v1/waves", json=WAVE)).json()
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.post(f"/api/v1/waves/{wave['id']}/jobs", json={"job_id": job["id"]})
    assert r.status_code == 200
    assert len(r.json()["jobs"]) == 1
    assert r.json()["jobs"][0]["id"] == job["id"]


@pytest.mark.asyncio
async def test_remove_job_from_wave(client):
    wave = (await client.post("/api/v1/waves", json=WAVE)).json()
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    await client.post(f"/api/v1/waves/{wave['id']}/jobs", json={"job_id": job["id"]})
    r = await client.delete(f"/api/v1/waves/{wave['id']}/jobs/{job['id']}")
    assert r.status_code == 200
    assert r.json()["jobs"] == []


@pytest.mark.asyncio
async def test_delete_wave(client):
    wave = (await client.post("/api/v1/waves", json=WAVE)).json()
    r = await client.delete(f"/api/v1/waves/{wave['id']}")
    assert r.status_code == 204
