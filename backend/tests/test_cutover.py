import pytest

JOB = {"name": "Cutover Job", "migration_type": "full_load"}
PLAN = {"strategy": "blue-green", "notes": "Weekend window preferred"}


@pytest.mark.asyncio
async def test_get_cutover_not_found(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.get(f"/api/v1/jobs/{job['id']}/cutover")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_create_cutover_plan(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.post(f"/api/v1/jobs/{job['id']}/cutover", json=PLAN)
    assert r.status_code == 201
    data = r.json()
    assert data["strategy"] == "blue-green"
    assert data["status"] == "planned"


@pytest.mark.asyncio
async def test_duplicate_cutover_rejected(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    await client.post(f"/api/v1/jobs/{job['id']}/cutover", json=PLAN)
    r = await client.post(f"/api/v1/jobs/{job['id']}/cutover", json=PLAN)
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_execute_cutover(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    await client.post(f"/api/v1/jobs/{job['id']}/cutover", json=PLAN)
    r = await client.post(f"/api/v1/jobs/{job['id']}/cutover/execute")
    assert r.status_code == 200
    assert r.json()["status"] == "in-progress"
    assert r.json()["started_at"] is not None


@pytest.mark.asyncio
async def test_complete_cutover(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    await client.post(f"/api/v1/jobs/{job['id']}/cutover", json=PLAN)
    await client.post(f"/api/v1/jobs/{job['id']}/cutover/execute")
    r = await client.post(f"/api/v1/jobs/{job['id']}/cutover/complete")
    assert r.status_code == 200
    assert r.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_rollback_cutover(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    await client.post(f"/api/v1/jobs/{job['id']}/cutover", json=PLAN)
    await client.post(f"/api/v1/jobs/{job['id']}/cutover/execute")
    r = await client.post(f"/api/v1/jobs/{job['id']}/cutover/rollback")
    assert r.status_code == 200
    assert r.json()["status"] == "rolled-back"
    assert r.json()["rolled_back_at"] is not None
