import pytest

JOB = {"name": "Runbook Job", "migration_type": "full_load"}
RUNBOOK = {"title": "Pre-Migration Checklist", "runbook_type": "pre-migration", "content": "## Step 1\nBack up source DB."}


@pytest.mark.asyncio
async def test_list_runbooks_empty(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.get(f"/api/v1/jobs/{job['id']}/runbooks")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_create_runbook(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.post(f"/api/v1/jobs/{job['id']}/runbooks", json=RUNBOOK)
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == RUNBOOK["title"]
    assert data["runbook_type"] == "pre-migration"


@pytest.mark.asyncio
async def test_update_runbook(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    rb = (await client.post(f"/api/v1/jobs/{job['id']}/runbooks", json=RUNBOOK)).json()
    r = await client.put(f"/api/v1/jobs/{job['id']}/runbooks/{rb['id']}", json={"title": "Updated"})
    assert r.status_code == 200
    assert r.json()["title"] == "Updated"


@pytest.mark.asyncio
async def test_delete_runbook(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    rb = (await client.post(f"/api/v1/jobs/{job['id']}/runbooks", json=RUNBOOK)).json()
    r = await client.delete(f"/api/v1/jobs/{job['id']}/runbooks/{rb['id']}")
    assert r.status_code == 204


@pytest.mark.asyncio
async def test_runbook_job_not_found(client):
    r = await client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000000/runbooks")
    assert r.status_code == 404
