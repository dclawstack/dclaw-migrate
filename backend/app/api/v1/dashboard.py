from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.connection_repo import ConnectionRepository
from app.repositories.migration_job_repo import MigrationJobRepository
from app.schemas.migration_job import MigrationJobRead

router = APIRouter()


class DashboardStats(BaseModel):
    total_connections: int
    total_jobs: int
    running_jobs: int
    completed_jobs: int
    failed_jobs: int
    recent_jobs: list[MigrationJobRead]


@router.get("", response_model=DashboardStats)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    conn_repo = ConnectionRepository(db)
    job_repo = MigrationJobRepository(db)

    total_connections, _ = await conn_repo.list_all(limit=1, offset=0)
    total_conn_count = await conn_repo.count()

    total_job_count = await job_repo.count()
    running = await job_repo.count_by_status("running")
    completed = await job_repo.count_by_status("completed")
    failed = await job_repo.count_by_status("failed")
    recent = await job_repo.list_recent(limit=5)

    return DashboardStats(
        total_connections=total_conn_count,
        total_jobs=total_job_count,
        running_jobs=running,
        completed_jobs=completed,
        failed_jobs=failed,
        recent_jobs=recent,
    )
