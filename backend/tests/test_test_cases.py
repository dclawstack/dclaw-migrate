import pytest

JOB = {"name": "Test Case Job", "migration_type": "full_load"}


@pytest.mark.asyncio
async def test_list_test_cases_empty(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.get(f"/api/v1/jobs/{job['id']}/test-cases")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_generate_tests_no_mappings(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.post(f"/api/v1/jobs/{job['id']}/generate-tests")
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_run_tests_no_cases(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.post(f"/api/v1/jobs/{job['id']}/run-tests")
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_job_not_found(client):
    r = await client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000000/test-cases")
    assert r.status_code == 404
