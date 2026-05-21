import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import utc_now
from app.repositories.migration_job_repo import MigrationJobRepository
from app.schemas.migration_job import (
    MigrationJobCreate,
    MigrationJobListResponse,
    MigrationJobRead,
    MigrationJobUpdate,
)

router = APIRouter()

_TERMINAL = {"completed", "failed"}
_RUNNABLE = {"draft", "ready", "paused"}


@router.get("", response_model=MigrationJobListResponse)
async def list_jobs(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    repo = MigrationJobRepository(db)
    items, total = await repo.list_all(limit=limit, offset=offset)
    return MigrationJobListResponse(items=items, total=total, limit=limit, offset=offset)


@router.post("", response_model=MigrationJobRead, status_code=201)
async def create_job(
    payload: MigrationJobCreate,
    db: AsyncSession = Depends(get_db),
):
    from app.models.migration_job import MigrationJob

    repo = MigrationJobRepository(db)
    obj = MigrationJob(**payload.model_dump())
    return await repo.create(obj)


@router.get("/{job_id}", response_model=MigrationJobRead)
async def get_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = MigrationJobRepository(db)
    obj = await repo.get_by_id(job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Job not found")
    return obj


@router.put("/{job_id}", response_model=MigrationJobRead)
async def update_job(
    job_id: uuid.UUID,
    payload: MigrationJobUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = MigrationJobRepository(db)
    obj = await repo.get_by_id(job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Job not found")
    if obj.status == "running":
        raise HTTPException(status_code=409, detail="Cannot edit a running job")
    data = payload.model_dump(exclude_unset=True)
    return await repo.update(obj, data)


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = MigrationJobRepository(db)
    obj = await repo.get_by_id(job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Job not found")
    if obj.status == "running":
        raise HTTPException(status_code=409, detail="Cannot delete a running job")
    await repo.delete(obj)


@router.post("/{job_id}/run", response_model=MigrationJobRead)
async def run_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = MigrationJobRepository(db)
    obj = await repo.get_by_id(job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Job not found")
    if obj.status not in _RUNNABLE:
        raise HTTPException(status_code=409, detail=f"Job cannot be started from status '{obj.status}'")
    return await repo.update(obj, {"status": "running", "started_at": utc_now()})


@router.post("/{job_id}/cancel", response_model=MigrationJobRead)
async def cancel_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = MigrationJobRepository(db)
    obj = await repo.get_by_id(job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Job not found")
    if obj.status in _TERMINAL:
        raise HTTPException(status_code=409, detail=f"Job is already '{obj.status}'")
    return await repo.update(obj, {"status": "failed", "completed_at": utc_now()})
