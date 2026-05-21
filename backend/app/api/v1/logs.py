import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.execution_log_repo import ExecutionLogRepository
from app.repositories.migration_job_repo import MigrationJobRepository
from app.schemas.execution_log import ExecutionLogListResponse

router = APIRouter()


@router.get("/{job_id}/logs", response_model=ExecutionLogListResponse)
async def list_logs(
    job_id: uuid.UUID,
    limit: int = 100,
    offset: int = 0,
    level: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    job_repo = MigrationJobRepository(db)
    if not await job_repo.get_by_id(job_id):
        raise HTTPException(status_code=404, detail="Job not found")

    log_repo = ExecutionLogRepository(db)
    items, total = await log_repo.list_by_job(job_id, limit=limit, offset=offset, level=level)
    return ExecutionLogListResponse(items=items, total=total)
