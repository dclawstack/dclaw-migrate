import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.execution_log import ExecutionLog
from app.models.validation_report import ValidationReport
from app.repositories.execution_log_repo import ExecutionLogRepository
from app.repositories.migration_job_repo import MigrationJobRepository
from app.repositories.schema_mapping_repo import SchemaMappingRepository
from app.repositories.validation_repo import ValidationReportRepository
from app.schemas.validation_report import ValidationReportRead, ValidationRunResponse
from app.services.validation import validate_tables

router = APIRouter()


@router.get("/{job_id}/validations", response_model=list[ValidationReportRead])
async def list_validations(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    if not await job_repo.get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    val_repo = ValidationReportRepository(db)
    return await val_repo.list_by_job(job_id)


@router.post("/{job_id}/validate", response_model=ValidationRunResponse)
async def run_validation(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    log_repo = ExecutionLogRepository(db)
    mapping_repo = SchemaMappingRepository(db)
    val_repo = ValidationReportRepository(db)

    job = await job_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.source_connection:
        raise HTTPException(status_code=422, detail="Job has no source connection")
    if not job.target_connection:
        raise HTTPException(status_code=422, detail="Job has no target connection")

    mappings, _ = await mapping_repo.list_by_job(job_id)
    if not mappings:
        raise HTTPException(
            status_code=422, detail="No schema mappings found. Run discovery first."
        )

    try:
        results = await validate_tables(job.source_connection, job.target_connection, mappings)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        await log_repo.create(
            ExecutionLog(job_id=job_id, level="error", message=f"Validation failed: {exc}")
        )
        raise HTTPException(status_code=502, detail=f"Validation connection error: {exc}")

    # Replace previous validation results for this job
    await val_repo.delete_by_job(job_id)

    reports = []
    for r in results:
        obj = ValidationReport(job_id=job_id, **r)
        reports.append(await val_repo.create(obj))

    passed = sum(1 for r in reports if r.status == "passed")
    failed = len(reports) - passed

    await log_repo.create(
        ExecutionLog(
            job_id=job_id,
            level="info" if failed == 0 else "warning",
            message=f"Validation complete: {passed} passed, {failed} failed out of {len(reports)} tables",
        )
    )

    return ValidationRunResponse(
        validated_tables=len(reports),
        passed=passed,
        failed=failed,
        reports=reports,
    )
