import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.migration_wave import MigrationWave
from app.repositories.migration_job_repo import MigrationJobRepository
from app.repositories.wave_repo import MigrationWaveRepository
from app.schemas.migration_wave import (
    AssignJobRequest,
    MigrationWaveCreate,
    MigrationWaveRead,
    MigrationWaveUpdate,
)

router = APIRouter()


@router.get("", response_model=list[MigrationWaveRead])
async def list_waves(db: AsyncSession = Depends(get_db)):
    repo = MigrationWaveRepository(db)
    return await repo.list_ordered()


@router.post("", response_model=MigrationWaveRead, status_code=201)
async def create_wave(payload: MigrationWaveCreate, db: AsyncSession = Depends(get_db)):
    repo = MigrationWaveRepository(db)
    obj = MigrationWave(**payload.model_dump())
    return await repo.create(obj)


@router.get("/{wave_id}", response_model=MigrationWaveRead)
async def get_wave(wave_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = MigrationWaveRepository(db)
    obj = await repo.get_by_id(wave_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Wave not found")
    return obj


@router.put("/{wave_id}", response_model=MigrationWaveRead)
async def update_wave(
    wave_id: uuid.UUID, payload: MigrationWaveUpdate, db: AsyncSession = Depends(get_db)
):
    repo = MigrationWaveRepository(db)
    obj = await repo.get_by_id(wave_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Wave not found")
    return await repo.update(obj, payload.model_dump(exclude_unset=True))


@router.delete("/{wave_id}", status_code=204)
async def delete_wave(wave_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = MigrationWaveRepository(db)
    obj = await repo.get_by_id(wave_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Wave not found")
    await repo.delete(obj)


@router.post("/{wave_id}/jobs", response_model=MigrationWaveRead)
async def assign_job_to_wave(
    wave_id: uuid.UUID, payload: AssignJobRequest, db: AsyncSession = Depends(get_db)
):
    wave_repo = MigrationWaveRepository(db)
    job_repo = MigrationJobRepository(db)

    wave = await wave_repo.get_by_id(wave_id)
    if not wave:
        raise HTTPException(status_code=404, detail="Wave not found")

    job = await job_repo.get_by_id(payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await job_repo.update(job, {"wave_id": wave_id})
    return await wave_repo.get_by_id(wave_id)


@router.delete("/{wave_id}/jobs/{job_id}", response_model=MigrationWaveRead)
async def remove_job_from_wave(
    wave_id: uuid.UUID, job_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    wave_repo = MigrationWaveRepository(db)
    job_repo = MigrationJobRepository(db)

    wave = await wave_repo.get_by_id(wave_id)
    if not wave:
        raise HTTPException(status_code=404, detail="Wave not found")

    job = await job_repo.get_by_id(job_id)
    if not job or job.wave_id != wave_id:
        raise HTTPException(status_code=404, detail="Job not in this wave")

    await job_repo.update(job, {"wave_id": None})
    return await wave_repo.get_by_id(wave_id)
