import pytest

JOB_PAYLOAD = {
    "name": "MySQL to Postgres",
    "description": "Full load migration",
    "migration_type": "full_load",
}


@pytest.mark.asyncio
async def test_list_jobs_empty(client):
    r = await client.get("/api/v1/jobs")
    assert r.status_code == 200
    data = r.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_create_job(client):
    r = await client.post("/api/v1/jobs", json=JOB_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == JOB_PAYLOAD["name"]
    assert data["status"] == "draft"
    assert data["source_connection"] is None
    assert data["target_connection"] is None


@pytest.mark.asyncio
async def test_list_jobs(client):
    await client.post("/api/v1/jobs", json=JOB_PAYLOAD)
    r = await client.get("/api/v1/jobs")
    assert r.status_code == 200
    assert r.json()["total"] == 1


@pytest.mark.asyncio
async def test_get_job(client):
    created = (await client.post("/api/v1/jobs", json=JOB_PAYLOAD)).json()
    r = await client.get(f"/api/v1/jobs/{created['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == created["id"]


@pytest.mark.asyncio
async def test_get_job_not_found(client):
    r = await client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_job(client):
    created = (await client.post("/api/v1/jobs", json=JOB_PAYLOAD)).json()
    r = await client.put(f"/api/v1/jobs/{created['id']}", json={"name": "Renamed"})
    assert r.status_code == 200
    assert r.json()["name"] == "Renamed"


@pytest.mark.asyncio
async def test_delete_job(client):
    created = (await client.post("/api/v1/jobs", json=JOB_PAYLOAD)).json()
    r = await client.delete(f"/api/v1/jobs/{created['id']}")
    assert r.status_code == 204
    assert (await client.get(f"/api/v1/jobs/{created['id']}")).status_code == 404


@pytest.mark.asyncio
async def test_run_job(client):
    created = (await client.post("/api/v1/jobs", json=JOB_PAYLOAD)).json()
    r = await client.post(f"/api/v1/jobs/{created['id']}/run")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "running"
    assert data["started_at"] is not None


@pytest.mark.asyncio
async def test_run_job_already_running(client):
    created = (await client.post("/api/v1/jobs", json=JOB_PAYLOAD)).json()
    await client.post(f"/api/v1/jobs/{created['id']}/run")
    r = await client.post(f"/api/v1/jobs/{created['id']}/run")
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_cancel_job(client):
    created = (await client.post("/api/v1/jobs", json=JOB_PAYLOAD)).json()
    await client.post(f"/api/v1/jobs/{created['id']}/run")
    r = await client.post(f"/api/v1/jobs/{created['id']}/cancel")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "failed"
    assert data["completed_at"] is not None


@pytest.mark.asyncio
async def test_cannot_edit_running_job(client):
    created = (await client.post("/api/v1/jobs", json=JOB_PAYLOAD)).json()
    await client.post(f"/api/v1/jobs/{created['id']}/run")
    r = await client.put(f"/api/v1/jobs/{created['id']}", json={"name": "Blocked"})
    assert r.status_code == 409
