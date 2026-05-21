import asyncio
import time
import uuid

import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import utc_now
from app.repositories.connection_repo import ConnectionRepository
from app.schemas.connection import (
    ConnectionCreate,
    ConnectionListResponse,
    ConnectionRead,
    ConnectionUpdate,
)

router = APIRouter()


@router.get("", response_model=ConnectionListResponse)
async def list_connections(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = ConnectionRepository(db)
    items, total = await repo.list_all(limit=limit, offset=offset)
    return ConnectionListResponse(items=items, total=total, limit=limit, offset=offset)


@router.post("", response_model=ConnectionRead, status_code=201)
async def create_connection(
    payload: ConnectionCreate,
    db: AsyncSession = Depends(get_db),
):
    from app.models.connection import Connection

    repo = ConnectionRepository(db)
    obj = Connection(**payload.model_dump())
    return await repo.create(obj)


@router.get("/{connection_id}", response_model=ConnectionRead)
async def get_connection(
    connection_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = ConnectionRepository(db)
    obj = await repo.get_by_id(connection_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Connection not found")
    return obj


@router.put("/{connection_id}", response_model=ConnectionRead)
async def update_connection(
    connection_id: uuid.UUID,
    payload: ConnectionUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = ConnectionRepository(db)
    obj = await repo.get_by_id(connection_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Connection not found")
    data = payload.model_dump(exclude_unset=True)
    return await repo.update(obj, data)


@router.delete("/{connection_id}", status_code=204)
async def delete_connection(
    connection_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = ConnectionRepository(db)
    obj = await repo.get_by_id(connection_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Connection not found")
    await repo.delete(obj)


@router.post("/{connection_id}/test")
async def test_connection(
    connection_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = ConnectionRepository(db)
    obj = await repo.get_by_id(connection_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Connection not found")

    start = time.monotonic()
    ok = False
    error_msg = None

    try:
        if obj.connection_type in ("postgresql", "aws_rds", "gcp_cloudsql", "azure_sql"):
            conn = await asyncio.wait_for(
                asyncpg.connect(
                    host=obj.host,
                    port=obj.port,
                    user=obj.username,
                    password=obj.password_secret,
                    database=obj.database_name,
                    ssl="require" if obj.ssl_enabled else None,
                ),
                timeout=5.0,
            )
            await conn.close()
        ok = True
    except Exception as exc:
        error_msg = str(exc)

    latency_ms = int((time.monotonic() - start) * 1000)
    await repo.update(obj, {"status": "ok" if ok else "error", "last_tested_at": utc_now()})

    result: dict = {"ok": ok, "latency_ms": latency_ms}
    if error_msg:
        result["error"] = error_msg
    return result
