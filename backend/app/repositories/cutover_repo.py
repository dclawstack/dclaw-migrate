import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cutover_plan import CutoverPlan
from app.repositories.base_repo import BaseRepository


class CutoverPlanRepository(BaseRepository[CutoverPlan]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, CutoverPlan)

    async def update(self, obj: CutoverPlan, data: dict) -> CutoverPlan:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def get_by_job(self, job_id: uuid.UUID) -> CutoverPlan | None:
        result = await self.db.execute(
            select(CutoverPlan).where(CutoverPlan.job_id == job_id)
        )
        return result.scalar_one_or_none()
