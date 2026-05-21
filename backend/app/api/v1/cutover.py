import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.utils import utc_now
from app.models.cutover_plan import CutoverPlan
from app.models.execution_log import ExecutionLog
from app.repositories.cutover_repo import CutoverPlanRepository
from app.repositories.execution_log_repo import ExecutionLogRepository
from app.repositories.migration_job_repo import MigrationJobRepository
from app.schemas.cutover_plan import CutoverPlanCreate, CutoverPlanRead, CutoverPlanUpdate

router = APIRouter()


async def _get_plan_or_404(job_id: uuid.UUID, db: AsyncSession) -> CutoverPlan:
    repo = CutoverPlanRepository(db)
    obj = await repo.get_by_job(job_id)
    if not obj:
        raise HTTPException(status_code=404, detail="No cutover plan for this job")
    return obj


@router.get("/{job_id}/cutover", response_model=CutoverPlanRead)
async def get_cutover(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await _get_plan_or_404(job_id, db)


@router.post("/{job_id}/cutover", response_model=CutoverPlanRead, status_code=201)
async def create_cutover(
    job_id: uuid.UUID, payload: CutoverPlanCreate, db: AsyncSession = Depends(get_db)
):
    job_repo = MigrationJobRepository(db)
    if not await job_repo.get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")

    repo = CutoverPlanRepository(db)
    if await repo.get_by_job(job_id):
        raise HTTPException(status_code=409, detail="Cutover plan already exists for this job")

    obj = CutoverPlan(job_id=job_id, **payload.model_dump())
    return await repo.create(obj)


@router.put("/{job_id}/cutover", response_model=CutoverPlanRead)
async def update_cutover(
    job_id: uuid.UUID, payload: CutoverPlanUpdate, db: AsyncSession = Depends(get_db)
):
    obj = await _get_plan_or_404(job_id, db)
    repo = CutoverPlanRepository(db)
    return await repo.update(obj, payload.model_dump(exclude_unset=True))


@router.post("/{job_id}/cutover/execute", response_model=CutoverPlanRead)
async def execute_cutover(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    obj = await _get_plan_or_404(job_id, db)
    if obj.status != "planned":
        raise HTTPException(status_code=409, detail=f"Cannot execute from status '{obj.status}'")

    repo = CutoverPlanRepository(db)
    log_repo = ExecutionLogRepository(db)

    updated = await repo.update(obj, {"status": "in-progress", "started_at": utc_now()})
    await log_repo.create(ExecutionLog(
        job_id=job_id, level="info",
        message=f"Cutover started — strategy: {obj.strategy}"
    ))
    return updated


@router.post("/{job_id}/cutover/complete", response_model=CutoverPlanRead)
async def complete_cutover(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    obj = await _get_plan_or_404(job_id, db)
    if obj.status != "in-progress":
        raise HTTPException(status_code=409, detail="Cutover is not in progress")

    repo = CutoverPlanRepository(db)
    log_repo = ExecutionLogRepository(db)
    job_repo = MigrationJobRepository(db)

    job = await job_repo.get_by_id(job_id)
    if job:
        await job_repo.update(job, {"status": "completed", "completed_at": utc_now()})

    updated = await repo.update(obj, {"status": "completed", "completed_at": utc_now()})
    await log_repo.create(ExecutionLog(
        job_id=job_id, level="info", message="Cutover completed successfully"
    ))
    return updated


@router.post("/{job_id}/cutover/rollback", response_model=CutoverPlanRead)
async def rollback_cutover(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    obj = await _get_plan_or_404(job_id, db)
    if obj.status not in ("in-progress", "completed"):
        raise HTTPException(status_code=409, detail=f"Cannot rollback from status '{obj.status}'")

    repo = CutoverPlanRepository(db)
    log_repo = ExecutionLogRepository(db)
    job_repo = MigrationJobRepository(db)

    job = await job_repo.get_by_id(job_id)
    if job:
        await job_repo.update(job, {"status": "failed", "completed_at": utc_now()})

    updated = await repo.update(obj, {"status": "rolled-back", "rolled_back_at": utc_now()})
    await log_repo.create(ExecutionLog(
        job_id=job_id, level="warning", message="Cutover rolled back"
    ))
    return updated
