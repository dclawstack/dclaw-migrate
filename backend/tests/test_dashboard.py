import pytest

CONN = {
    "name": "Source DB",
    "connection_type": "postgresql",
    "role": "source",
    "host": "localhost",
    "port": 5432,
    "database_name": "mydb",
    "username": "admin",
    "password_secret": "s3cr3t",
}

JOB = {"name": "Test Job", "migration_type": "full_load"}


@pytest.mark.asyncio
async def test_dashboard_empty(client):
    r = await client.get("/api/v1/dashboard")
    assert r.status_code == 200
    data = r.json()
    assert data["total_connections"] == 0
    assert data["total_jobs"] == 0
    assert data["running_jobs"] == 0
    assert data["completed_jobs"] == 0
    assert data["failed_jobs"] == 0
    assert data["recent_jobs"] == []


@pytest.mark.asyncio
async def test_dashboard_with_data(client):
    await client.post("/api/v1/connections", json=CONN)
    job_resp = (await client.post("/api/v1/jobs", json=JOB)).json()
    await client.post(f"/api/v1/jobs/{job_resp['id']}/run")

    r = await client.get("/api/v1/dashboard")
    assert r.status_code == 200
    data = r.json()
    assert data["total_connections"] == 1
    assert data["total_jobs"] == 1
    assert data["running_jobs"] == 1
    assert len(data["recent_jobs"]) == 1
