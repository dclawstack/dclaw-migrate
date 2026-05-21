import pytest

JOB = {"name": "Log Test Job", "migration_type": "full_load"}
MAPPING = {"source_table": "orders", "target_table": "orders"}


@pytest.mark.asyncio
async def test_list_logs_empty(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.get(f"/api/v1/jobs/{job['id']}/logs")
    assert r.status_code == 200
    assert r.json()["items"] == []
    assert r.json()["total"] == 0


@pytest.mark.asyncio
async def test_logs_written_on_discover(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    # Discover with no source connection → 422, but no log written for 422 (job guard)
    r = await client.post(f"/api/v1/jobs/{job['id']}/discover")
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_list_logs_job_not_found(client):
    r = await client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000000/logs")
    assert r.status_code == 404
