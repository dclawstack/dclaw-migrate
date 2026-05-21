import pytest

JOB = {"name": "Validation Test Job", "migration_type": "full_load"}


@pytest.mark.asyncio
async def test_list_validations_empty(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.get(f"/api/v1/jobs/{job['id']}/validations")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_validate_no_source_connection(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.post(f"/api/v1/jobs/{job['id']}/validate")
    assert r.status_code == 422
    assert "source connection" in r.json()["detail"]


@pytest.mark.asyncio
async def test_validate_no_mappings(client):
    conn_src = {
        "name": "Src", "connection_type": "postgresql", "role": "source",
        "host": "localhost", "port": 5432, "database_name": "src_db",
        "username": "admin", "password_secret": "s3cr3t",
    }
    conn_tgt = {
        "name": "Tgt", "connection_type": "postgresql", "role": "target",
        "host": "localhost", "port": 5432, "database_name": "tgt_db",
        "username": "admin", "password_secret": "s3cr3t",
    }
    src = (await client.post("/api/v1/connections", json=conn_src)).json()
    tgt = (await client.post("/api/v1/connections", json=conn_tgt)).json()

    job = (await client.post("/api/v1/jobs", json={
        **JOB,
        "source_connection_id": src["id"],
        "target_connection_id": tgt["id"],
    })).json()

    r = await client.post(f"/api/v1/jobs/{job['id']}/validate")
    assert r.status_code == 422
    assert "discovery" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_list_validations_job_not_found(client):
    r = await client.get("/api/v1/jobs/00000000-0000-0000-0000-000000000000/validations")
    assert r.status_code == 404
