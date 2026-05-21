import pytest

PAYLOAD = {
    "name": "Prod Postgres",
    "connection_type": "postgresql",
    "role": "source",
    "host": "localhost",
    "port": 5432,
    "database_name": "mydb",
    "username": "admin",
    "password_secret": "s3cr3t",
    "ssl_enabled": False,
}


@pytest.mark.asyncio
async def test_list_connections_empty(client):
    r = await client.get("/api/v1/connections")
    assert r.status_code == 200
    data = r.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_create_connection(client):
    r = await client.post("/api/v1/connections", json=PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == PAYLOAD["name"]
    assert data["status"] == "unchecked"
    assert "password_secret" not in data


@pytest.mark.asyncio
async def test_list_connections(client):
    await client.post("/api/v1/connections", json=PAYLOAD)
    r = await client.get("/api/v1/connections")
    assert r.status_code == 200
    assert r.json()["total"] == 1


@pytest.mark.asyncio
async def test_get_connection(client):
    created = (await client.post("/api/v1/connections", json=PAYLOAD)).json()
    r = await client.get(f"/api/v1/connections/{created['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == created["id"]


@pytest.mark.asyncio
async def test_get_connection_not_found(client):
    r = await client.get("/api/v1/connections/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_update_connection(client):
    created = (await client.post("/api/v1/connections", json=PAYLOAD)).json()
    r = await client.put(f"/api/v1/connections/{created['id']}", json={"name": "Updated"})
    assert r.status_code == 200
    assert r.json()["name"] == "Updated"


@pytest.mark.asyncio
async def test_delete_connection(client):
    created = (await client.post("/api/v1/connections", json=PAYLOAD)).json()
    r = await client.delete(f"/api/v1/connections/{created['id']}")
    assert r.status_code == 204
    r2 = await client.get(f"/api/v1/connections/{created['id']}")
    assert r2.status_code == 404


@pytest.mark.asyncio
async def test_delete_connection_not_found(client):
    r = await client.delete("/api/v1/connections/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
