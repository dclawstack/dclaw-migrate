import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.asset_repo import ApplicationAssetRepository
from app.repositories.migration_job_repo import MigrationJobRepository
from app.repositories.schema_mapping_repo import SchemaMappingRepository
from app.repositories.wave_repo import MigrationWaveRepository
from app.services import ai_copilot

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    job_id: Optional[uuid.UUID] = None
    history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str


# ── P0.1 Core Chat ─────────────────────────────────────────────────────────────

@router.post("/migrate-chat", response_model=ChatResponse)
async def migrate_chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    job_context = None
    if payload.job_id:
        job_repo = MigrationJobRepository(db)
        job = await job_repo.get_by_id(payload.job_id)
        if job:
            mapping_repo = SchemaMappingRepository(db)
            mappings, _ = await mapping_repo.list_by_job(payload.job_id)
            job_context = {
                "name": job.name,
                "migration_type": job.migration_type,
                "status": job.status,
                "source": (
                    f"{job.source_connection.connection_type} at {job.source_connection.host}"
                    if job.source_connection else None
                ),
                "target": (
                    f"{job.target_connection.connection_type} at {job.target_connection.host}"
                    if job.target_connection else None
                ),
                "tables": list({m.source_table for m in mappings}),
            }

    system_msg = ai_copilot.build_system_message(job_context)
    messages = [system_msg] + payload.history + [{"role": "user", "content": payload.message}]
    try:
        reply = await ai_copilot.chat(messages)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
    return ChatResponse(reply=reply)


# ── P0.2 Schema Suggest & Risk ─────────────────────────────────────────────────

@router.post("/suggest-mappings", response_model=ChatResponse)
async def suggest_mappings(
    payload: BaseModel, db: AsyncSession = Depends(get_db)  # type: ignore[valid-type]
):
    raise HTTPException(status_code=422, detail="Pass job_id in request body")


class SuggestMappingsRequest(BaseModel):
    job_id: uuid.UUID


@router.post("/suggest-mappings", response_model=ChatResponse, include_in_schema=False)
async def _suggest_mappings_impl(
    payload: SuggestMappingsRequest, db: AsyncSession = Depends(get_db)
):
    job_repo = MigrationJobRepository(db)
    job = await job_repo.get_by_id(payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    mapping_repo = SchemaMappingRepository(db)
    mappings, _ = await mapping_repo.list_by_job(payload.job_id)
    if not mappings:
        raise HTTPException(status_code=422, detail="Run schema discovery first")
    src = job.source_connection.connection_type if job.source_connection else "unknown"
    tgt = job.target_connection.connection_type if job.target_connection else "unknown"
    tables = "\n".join(f"- {m.source_table} → {m.target_table}" for m in mappings[:30])
    prompt = (
        f"Migrating from {src} to {tgt}. Mappings:\n{tables}\n\n"
        "For each table: data type differences, transformation rules needed, data quality issues."
    )
    system_msg = ai_copilot.build_system_message()
    try:
        reply = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
    return ChatResponse(reply=reply)


class AssessRiskRequest(BaseModel):
    job_id: uuid.UUID


@router.post("/assess-risk", response_model=ChatResponse)
async def assess_risk(payload: AssessRiskRequest, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    job = await job_repo.get_by_id(payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    mapping_repo = SchemaMappingRepository(db)
    mappings, _ = await mapping_repo.list_by_job(payload.job_id)
    src = job.source_connection.connection_type if job.source_connection else "unknown"
    tgt = job.target_connection.connection_type if job.target_connection else "unknown"
    prompt = (
        f"Top migration risks for {job.name} ({src} → {tgt}), {len(mappings)} tables.\n"
        "List top 5 risks: description, severity (HIGH/MEDIUM/LOW), concrete mitigation."
    )
    system_msg = ai_copilot.build_system_message()
    try:
        reply = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
    return ChatResponse(reply=reply)


# ── P0.3 Wave Planning ─────────────────────────────────────────────────────────

class PlanWavesRequest(BaseModel):
    job_ids: Optional[list[uuid.UUID]] = None


@router.post("/plan-waves", response_model=ChatResponse)
async def plan_waves(payload: PlanWavesRequest, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    wave_repo = MigrationWaveRepository(db)
    all_jobs, _ = await job_repo.list_all(limit=100)
    target = [j for j in all_jobs if j.id in payload.job_ids] if payload.job_ids else all_jobs
    waves = await wave_repo.list_ordered()
    summary = "\n".join(f"- {j.name} ({j.migration_type}, {j.status})" for j in target[:30])
    existing = f"\nExisting waves: {len(waves)}" if waves else ""
    prompt = (
        f"Group {len(target)} jobs into migration waves.\nJobs:\n{summary}{existing}\n\n"
        "Group by dependency and risk. Suggest 3-5 waves with names, assignments, rationale."
    )
    system_msg = ai_copilot.build_system_message()
    try:
        reply = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
    return ChatResponse(reply=reply)


# ── P1.1 Application Assessment ────────────────────────────────────────────────

class AssessApplicationRequest(BaseModel):
    asset_id: uuid.UUID


@router.post("/assess-application", response_model=ChatResponse)
async def assess_application(payload: AssessApplicationRequest, db: AsyncSession = Depends(get_db)):
    repo = ApplicationAssetRepository(db)
    asset = await repo.get_by_id(payload.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    prompt = (
        f"Assess {asset.name} ({asset.asset_type}), "
        f"current: {asset.current_host or 'unknown'}, target: {asset.target_host or 'TBD'}.\n"
        "Provide: recommended strategy (lift-and-shift/replatform/refactor/replace/retire/retain), "
        "effort days, risk level, top 3 risks, key steps."
    )
    system_msg = ai_copilot.build_system_message()
    try:
        reply = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
    return ChatResponse(reply=reply)


# ── P1.3 Cutover Planning ──────────────────────────────────────────────────────

class PlanCutoverRequest(BaseModel):
    job_id: uuid.UUID


@router.post("/plan-cutover", response_model=ChatResponse)
async def plan_cutover_ai(payload: PlanCutoverRequest, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    mapping_repo = SchemaMappingRepository(db)
    job = await job_repo.get_by_id(payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    mappings, _ = await mapping_repo.list_by_job(payload.job_id)
    src = job.source_connection.connection_type if job.source_connection else "unknown"
    tgt = job.target_connection.connection_type if job.target_connection else "unknown"
    prompt = (
        f"Cutover plan for {job.name} ({src} → {tgt}), {len(mappings)} tables.\n"
        "Provide: strategy (blue-green/rolling/in-place), optimal window, "
        "pre-cutover checklist, post-cutover validation, rollback triggers and steps."
    )
    system_msg = ai_copilot.build_system_message()
    try:
        reply = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
    return ChatResponse(reply=reply)


# ── P2.1 Multi-Cloud Strategy ──────────────────────────────────────────────────

class CloudStrategyRequest(BaseModel):
    asset_id: uuid.UUID
    source_cloud: Optional[str] = None
    target_clouds: list[str] = ["aws", "gcp", "azure"]


@router.post("/cloud-strategy", response_model=ChatResponse)
async def cloud_strategy(payload: CloudStrategyRequest, db: AsyncSession = Depends(get_db)):
    repo = ApplicationAssetRepository(db)
    asset = await repo.get_by_id(payload.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    prompt = (
        f"Multi-cloud strategy for {asset.name} ({asset.asset_type}) "
        f"from {payload.source_cloud or 'on-prem'} to {', '.join(payload.target_clouds)}.\n"
        "Provide: recommendation, services per cloud, cost comparison, lock-in risks."
    )
    system_msg = ai_copilot.build_system_message()
    try:
        reply = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
    await repo.update(asset, {"cloud_strategy": reply})
    return ChatResponse(reply=reply)


# ── P2.2 Containerization ──────────────────────────────────────────────────────

class ContainerizeRequest(BaseModel):
    asset_id: uuid.UUID


@router.post("/containerize", response_model=ChatResponse)
async def containerize(payload: ContainerizeRequest, db: AsyncSession = Depends(get_db)):
    repo = ApplicationAssetRepository(db)
    asset = await repo.get_by_id(payload.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    prompt = (
        f"Containerize {asset.name} ({asset.asset_type}), host: {asset.current_host or 'unknown'}.\n"
        "Provide: complexity, production Dockerfile, K8s Deployment+Service YAML, "
        "resource limits, health checks."
    )
    system_msg = ai_copilot.build_system_message()
    try:
        reply = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")
    await repo.update(asset, {"containerization_plan": reply})
    return ChatResponse(reply=reply)
