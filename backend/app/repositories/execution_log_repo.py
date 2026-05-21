import uuid

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.execution_log import ExecutionLog
from app.repositories.base_repo import BaseRepository


class ExecutionLogRepository(BaseRepository[ExecutionLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ExecutionLog)

    async def list_by_job(
        self, job_id: uuid.UUID, limit: int = 100, offset: int = 0, level: str | None = None
    ) -> tuple[list[ExecutionLog], int]:
        query = select(ExecutionLog).where(ExecutionLog.job_id == job_id)
        if level:
            query = query.where(ExecutionLog.level == level)
        query = query.order_by(desc(ExecutionLog.created_at)).limit(limit).offset(offset)

        result = await self.db.execute(query)
        items = list(result.scalars().all())

        count_q = select(func.count()).select_from(ExecutionLog).where(ExecutionLog.job_id == job_id)
        if level:
            count_q = count_q.where(ExecutionLog.level == level)
        total = (await self.db.execute(count_q)).scalar() or 0

        return items, total
