import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import utc_now
from app.models.execution_log import ExecutionLog
from app.models.schema_mapping import SchemaMapping
from app.repositories.execution_log_repo import ExecutionLogRepository
from app.repositories.migration_job_repo import MigrationJobRepository
from app.repositories.schema_mapping_repo import SchemaMappingRepository
from app.schemas.schema_mapping import (
    DiscoverResponse,
    SchemaMappingCreate,
    SchemaMappingRead,
    SchemaMappingUpdate,
)
from app.services.schema_discovery import discover_schema

router = APIRouter()


@router.get("/{job_id}/mappings", response_model=list[SchemaMappingRead])
async def list_mappings(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = SchemaMappingRepository(db)
    items, _ = await repo.list_by_job(job_id)
    return items


@router.post("/{job_id}/mappings", response_model=SchemaMappingRead, status_code=201)
async def create_mapping(
    job_id: uuid.UUID,
    payload: SchemaMappingCreate,
    db: AsyncSession = Depends(get_db),
):
    job_repo = MigrationJobRepository(db)
    if not await job_repo.get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")

    repo = SchemaMappingRepository(db)
    obj = SchemaMapping(job_id=job_id, **payload.model_dump())
    return await repo.create(obj)


@router.put("/{job_id}/mappings/{mapping_id}", response_model=SchemaMappingRead)
async def update_mapping(
    job_id: uuid.UUID,
    mapping_id: uuid.UUID,
    payload: SchemaMappingUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = SchemaMappingRepository(db)
    obj = await repo.get_by_id(mapping_id)
    if not obj or obj.job_id != job_id:
        raise HTTPException(status_code=404, detail="Mapping not found")
    return await repo.update(obj, payload.model_dump(exclude_unset=True))


@router.delete("/{job_id}/mappings/{mapping_id}", status_code=204)
async def delete_mapping(
    job_id: uuid.UUID,
    mapping_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = SchemaMappingRepository(db)
    obj = await repo.get_by_id(mapping_id)
    if not obj or obj.job_id != job_id:
        raise HTTPException(status_code=404, detail="Mapping not found")
    await repo.delete(obj)


@router.post("/{job_id}/discover", response_model=DiscoverResponse)
async def discover_job_schema(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    log_repo = ExecutionLogRepository(db)
    mapping_repo = SchemaMappingRepository(db)

    job = await job_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.source_connection:
        raise HTTPException(status_code=422, detail="Job has no source connection configured")

    try:
        schema = await discover_schema(job.source_connection)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        await log_repo.create(
            ExecutionLog(job_id=job_id, level="error", message=f"Discovery failed: {exc}")
        )
        raise HTTPException(status_code=502, detail=f"Connection to source failed: {exc}")

    # Replace existing draft mappings
    await mapping_repo.delete_by_job(job_id)

    mappings = []
    for table_info in schema:
        obj = SchemaMapping(
            job_id=job_id,
            source_table=table_info["table"],
            target_table=table_info["table"],
        )
        mappings.append(await mapping_repo.create(obj))

    await log_repo.create(
        ExecutionLog(
            job_id=job_id,
            level="info",
            message=f"Schema discovery complete: {len(mappings)} table(s) found",
        )
    )

    return DiscoverResponse(discovered=len(mappings), mappings=mappings)
