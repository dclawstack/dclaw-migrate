import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.runbook import Runbook
from app.repositories.base_repo import BaseRepository


class RunbookRepository(BaseRepository[Runbook]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Runbook)

    async def update(self, obj: Runbook, data: dict) -> Runbook:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def list_by_job(self, job_id: uuid.UUID) -> list[Runbook]:
        result = await self.db.execute(
            select(Runbook).where(Runbook.job_id == job_id).order_by(Runbook.created_at.desc())
        )
        return list(result.scalars().all())
