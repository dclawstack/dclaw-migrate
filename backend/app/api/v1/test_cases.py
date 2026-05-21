import uuid
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.test_case import TestCase
from app.repositories.execution_log_repo import ExecutionLogRepository
from app.models.execution_log import ExecutionLog
from app.repositories.migration_job_repo import MigrationJobRepository
from app.repositories.schema_mapping_repo import SchemaMappingRepository
from app.repositories.test_case_repo import TestCaseRepository
from app.schemas.test_case import TestCaseRead, TestCaseUpdate, TestRunResponse
from app.services import ai_copilot

router = APIRouter()


@router.get("/{job_id}/test-cases", response_model=list[TestCaseRead])
async def list_test_cases(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    if not await job_repo.get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    repo = TestCaseRepository(db)
    return await repo.list_by_job(job_id)


@router.post("/{job_id}/generate-tests", response_model=list[TestCaseRead])
async def generate_tests(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    job_repo = MigrationJobRepository(db)
    mapping_repo = SchemaMappingRepository(db)
    test_repo = TestCaseRepository(db)
    log_repo = ExecutionLogRepository(db)

    job = await job_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    mappings, _ = await mapping_repo.list_by_job(job_id)
    if not mappings:
        raise HTTPException(status_code=422, detail="Run schema discovery first")

    src_type = job.source_connection.connection_type if job.source_connection else "unknown"
    tgt_type = job.target_connection.connection_type if job.target_connection else "unknown"
    tables = list({m.source_table for m in mappings if not m.is_excluded})[:20]

    prompt = (
        f"Generate a JSON array of test cases for a {src_type} → {tgt_type} migration.\n"
        f"Tables: {', '.join(tables)}\n\n"
        "For each table generate 2-3 test cases. Each test case must be a JSON object with:\n"
        '- "name": short test name\n'
        '- "test_type": one of row_count|data_integrity|schema|performance\n'
        '- "description": what it checks\n'
        '- "query_source": SQL to run on source (or null)\n'
        '- "query_target": SQL to run on target (or null)\n'
        '- "expected_result": what a passing result looks like\n\n'
        "Return ONLY the JSON array, no explanation."
    )

    system_msg = ai_copilot.build_system_message()
    try:
        raw = await ai_copilot.chat([system_msg, {"role": "user", "content": prompt}])
        start = raw.find("[")
        end = raw.rfind("]") + 1
        cases_data = json.loads(raw[start:end]) if start >= 0 else []
    except Exception:
        cases_data = []

    await test_repo.delete_by_job(job_id)

    created = []
    for c in cases_data:
        obj = TestCase(
            job_id=job_id,
            name=c.get("name", "Unnamed test"),
            description=c.get("description"),
            test_type=c.get("test_type", "data_integrity"),
            query_source=c.get("query_source"),
            query_target=c.get("query_target"),
            expected_result=c.get("expected_result"),
            status="pending",
        )
        created.append(await test_repo.create(obj))

    await log_repo.create(ExecutionLog(
        job_id=job_id, level="info",
        message=f"Generated {len(created)} test case(s) via AI"
    ))
    return created


@router.post("/{job_id}/run-tests", response_model=TestRunResponse)
async def run_tests(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Execute pending test cases (row_count type only — others marked skipped)."""
    job_repo = MigrationJobRepository(db)
    test_repo = TestCaseRepository(db)
    log_repo = ExecutionLogRepository(db)

    job = await job_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    cases = await test_repo.list_by_job(job_id)
    if not cases:
        raise HTTPException(status_code=422, detail="No test cases found. Generate tests first.")

    has_connections = job.source_connection and job.target_connection
    passed = failed = skipped = 0

    for case in cases:
        if case.test_type == "row_count" and has_connections:
            try:
                import asyncpg, asyncio
                src = await asyncio.wait_for(asyncpg.connect(
                    host=job.source_connection.host, port=job.source_connection.port,
                    user=job.source_connection.username, password=job.source_connection.password_secret,
                    database=job.source_connection.database_name,
                ), timeout=5.0)
                tgt = await asyncio.wait_for(asyncpg.connect(
                    host=job.target_connection.host, port=job.target_connection.port,
                    user=job.target_connection.username, password=job.target_connection.password_secret,
                    database=job.target_connection.database_name,
                ), timeout=5.0)
                src_val = await src.fetchval(case.query_source) if case.query_source else None
                tgt_val = await tgt.fetchval(case.query_target) if case.query_target else None
                await src.close(); await tgt.close()
                actual = f"source={src_val}, target={tgt_val}"
                ok = src_val == tgt_val
                await test_repo.update(case, {
                    "status": "passed" if ok else "failed",
                    "actual_result": actual,
                })
                if ok: passed += 1
                else: failed += 1
            except Exception as e:
                await test_repo.update(case, {"status": "failed", "error_message": str(e)})
                failed += 1
        else:
            await test_repo.update(case, {"status": "skipped"})
            skipped += 1

    await log_repo.create(ExecutionLog(
        job_id=job_id,
        level="info" if failed == 0 else "warning",
        message=f"Tests: {passed} passed, {failed} failed, {skipped} skipped",
    ))

    updated = await test_repo.list_by_job(job_id)
    return TestRunResponse(total=len(updated), passed=passed, failed=failed, skipped=skipped, cases=updated)
