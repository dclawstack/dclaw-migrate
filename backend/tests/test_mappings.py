import pytest

CONN = {
    "name": "Src", "connection_type": "postgresql", "role": "source",
    "host": "localhost", "port": 5432, "database_name": "mydb",
    "username": "admin", "password_secret": "s3cr3t",
}
JOB = {"name": "Test Job", "migration_type": "full_load"}
MAPPING = {"source_table": "users", "target_table": "users"}


@pytest.mark.asyncio
async def test_list_mappings_empty(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.get(f"/api/v1/jobs/{job['id']}/mappings")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_create_mapping(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.post(f"/api/v1/jobs/{job['id']}/mappings", json=MAPPING)
    assert r.status_code == 201
    data = r.json()
    assert data["source_table"] == "users"
    assert data["is_excluded"] is False
    assert data["source_column"] is None


@pytest.mark.asyncio
async def test_create_mapping_job_not_found(client):
    r = await client.post(
        "/api/v1/jobs/00000000-0000-0000-0000-000000000000/mappings", json=MAPPING
    )
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_mapping(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    m = (await client.post(f"/api/v1/jobs/{job['id']}/mappings", json=MAPPING)).json()
    r = await client.put(
        f"/api/v1/jobs/{job['id']}/mappings/{m['id']}",
        json={"target_table": "app_users", "is_excluded": True},
    )
    assert r.status_code == 200
    assert r.json()["target_table"] == "app_users"
    assert r.json()["is_excluded"] is True


@pytest.mark.asyncio
async def test_delete_mapping(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    m = (await client.post(f"/api/v1/jobs/{job['id']}/mappings", json=MAPPING)).json()
    r = await client.delete(f"/api/v1/jobs/{job['id']}/mappings/{m['id']}")
    assert r.status_code == 204
    remaining = (await client.get(f"/api/v1/jobs/{job['id']}/mappings")).json()
    assert remaining == []


@pytest.mark.asyncio
async def test_discover_no_source_connection(client):
    job = (await client.post("/api/v1/jobs", json=JOB)).json()
    r = await client.post(f"/api/v1/jobs/{job['id']}/discover")
    assert r.status_code == 422
