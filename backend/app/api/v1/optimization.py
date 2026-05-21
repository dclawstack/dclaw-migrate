import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.execution_log import ExecutionLog
from app.models.optimization_rec import OptimizationRec
from app.repositories.execution_log_repo import ExecutionLogRepository
from app.repositories.migration_job_repo import MigrationJobRepository
from app.repositories.optimization_repo import OptimizationRecRepository
from app.repositories.schema_mapping_repo import SchemaMappingRepository
from app.schemas.optimization_rec import OptimizationRecRead, OptimizationRecUpdate, OptimizationRunResponse
from app.services import ai_copilot

router = APIRouter()


@router.get("/{job_id}/optimizations", response_model=list[OptimizationRecRead])
async def list_optimizations(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    if not await job_repo.get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    repo = OptimizationRecRepository(db)
    return await repo.list_by_job(job_id)


@router.post("/{job_id}/optimizations/{rec_id}", response_model=OptimizationRecRead)
async def update_optimization_status(
    job_id: uuid.UUID, rec_id: uuid.UUID,
    payload: OptimizationRecUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = OptimizationRecRepository(db)
    obj = await repo.get_by_id(rec_id)
    if not obj or obj.job_id != job_id:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return await repo.update(obj, payload.model_dump(exclude_unset=True))


@router.post("/{job_id}/optimize", response_model=OptimizationRunResponse)
async def generate_optimizations(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    opt_repo = OptimizationRecRepository(db)
    mapping_repo = SchemaMappingRepository(db)
    log_repo = ExecutionLogRepository(db)

    job = await job_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    mappings, _ = await mapping_repo.list_by_job(job_id)
    src_type = job.source_connection.connection_type if job.source_connection else "unknown"
    tgt_type = job.target_connection.connection_type if job.target_connection else "unknown"

    prompt = (
        f"Analyze this completed migration and generate optimization recommendations.\n"
        f"Source: {src_type}, Target: {tgt_type}, Tables migrated: {len(mappings)}\n\n"
        "Return a JSON array of recommendations. Each must have:\n"
        '- "category": one of cost|performance|security|reliability\n'
        '- "title": short title (max 60 chars)\n'
        '- "description": detailed recommendation\n'
        '- "estimated_savings": e.g. "30% cost reduction" or null\n'
        '- "priority": one of high|medium|low\n\n'
        "Generate at least 4 recommendations. Return ONLY the JSON array."
    )

    system_msg = ai_copilot.build_system_message()
    try:
        raw = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
        start = raw.find("[")
        end = raw.rfind("]") + 1
        recs_data = json.loads(raw[start:end]) if start >= 0 else []
    except Exception:
        recs_data = []

    await opt_repo.delete_by_job(job_id)

    created = []
    for r in recs_data:
        obj = OptimizationRec(
            job_id=job_id,
            category=r.get("category", "performance"),
            title=r.get("title", "Recommendation")[:255],
            description=r.get("description", ""),
            estimated_savings=r.get("estimated_savings"),
            priority=r.get("priority", "medium"),
            status="pending",
        )
        created.append(await opt_repo.create(obj))

    await log_repo.create(ExecutionLog(
        job_id=job_id, level="info",
        message=f"Generated {len(created)} optimization recommendation(s)"
    ))

    return OptimizationRunResponse(generated=len(created), recommendations=created)
