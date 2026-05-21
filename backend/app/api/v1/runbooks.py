import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.runbook import Runbook
from app.repositories.migration_job_repo import MigrationJobRepository
from app.repositories.runbook_repo import RunbookRepository
from app.repositories.schema_mapping_repo import SchemaMappingRepository
from app.schemas.runbook import GenerateRunbookRequest, RunbookCreate, RunbookRead, RunbookUpdate
from app.services import ai_copilot

router = APIRouter()


@router.get("/{job_id}/runbooks", response_model=list[RunbookRead])
async def list_runbooks(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    if not await job_repo.get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    repo = RunbookRepository(db)
    return await repo.list_by_job(job_id)


@router.post("/{job_id}/runbooks", response_model=RunbookRead, status_code=201)
async def create_runbook(
    job_id: uuid.UUID, payload: RunbookCreate, db: AsyncSession = Depends(get_db)
):
    job_repo = MigrationJobRepository(db)
    if not await job_repo.get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    repo = RunbookRepository(db)
    obj = Runbook(job_id=job_id, **payload.model_dump())
    return await repo.create(obj)


@router.put("/{job_id}/runbooks/{runbook_id}", response_model=RunbookRead)
async def update_runbook(
    job_id: uuid.UUID, runbook_id: uuid.UUID,
    payload: RunbookUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = RunbookRepository(db)
    obj = await repo.get_by_id(runbook_id)
    if not obj or obj.job_id != job_id:
        raise HTTPException(status_code=404, detail="Runbook not found")
    return await repo.update(obj, payload.model_dump(exclude_unset=True))


@router.delete("/{job_id}/runbooks/{runbook_id}", status_code=204)
async def delete_runbook(
    job_id: uuid.UUID, runbook_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    repo = RunbookRepository(db)
    obj = await repo.get_by_id(runbook_id)
    if not obj or obj.job_id != job_id:
        raise HTTPException(status_code=404, detail="Runbook not found")
    await repo.delete(obj)


@router.post("/{job_id}/runbooks/generate", response_model=RunbookRead, status_code=201)
async def generate_runbook(
    job_id: uuid.UUID,
    payload: GenerateRunbookRequest,
    db: AsyncSession = Depends(get_db),
):
    job_repo = MigrationJobRepository(db)
    mapping_repo = SchemaMappingRepository(db)
    runbook_repo = RunbookRepository(db)

    job = await job_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    mappings, _ = await mapping_repo.list_by_job(job_id)
    src_type = job.source_connection.connection_type if job.source_connection else "unknown"
    tgt_type = job.target_connection.connection_type if job.target_connection else "unknown"
    tables = [m.source_table for m in mappings if not m.is_excluded][:20]

    type_prompts = {
        "pre-migration": "pre-migration preparation checklist and steps",
        "cutover": "cutover execution procedure with exact steps and go/no-go criteria",
        "rollback": "rollback procedure with triggers and step-by-step recovery",
        "post-migration": "post-migration verification, monitoring, and cleanup steps",
        "general": "complete migration runbook covering all phases",
    }
    topic = type_prompts.get(payload.runbook_type, "general migration runbook")

    prompt = (
        f"Generate a detailed {topic} for this migration:\n"
        f"- Job: {job.name} ({job.migration_type})\n"
        f"- Source: {src_type}, Target: {tgt_type}\n"
        f"- Tables: {', '.join(tables) if tables else 'not yet discovered'}\n\n"
        "Format as a structured markdown document with numbered steps, "
        "estimated time per step, responsible role, and success criteria. "
        "Be specific and actionable."
    )

    system_msg = ai_copilot.build_system_message()
    try:
        content = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    title_map = {
        "pre-migration": "Pre-Migration Runbook",
        "cutover": "Cutover Runbook",
        "rollback": "Rollback Runbook",
        "post-migration": "Post-Migration Runbook",
        "general": "Migration Runbook",
    }
    obj = Runbook(
        job_id=job_id,
        title=f"{title_map.get(payload.runbook_type, 'Runbook')} — {job.name}",
        runbook_type=payload.runbook_type,
        content=content,
    )
    return await runbook_repo.create(obj)
