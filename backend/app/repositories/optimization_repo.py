import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.optimization_rec import OptimizationRec
from app.repositories.base_repo import BaseRepository


class OptimizationRecRepository(BaseRepository[OptimizationRec]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, OptimizationRec)

    async def update(self, obj: OptimizationRec, data: dict) -> OptimizationRec:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def list_by_job(self, job_id: uuid.UUID) -> list[OptimizationRec]:
        result = await self.db.execute(
            select(OptimizationRec)
            .where(OptimizationRec.job_id == job_id)
            .order_by(OptimizationRec.created_at.desc())
        )
        return list(result.scalars().all())

    async def delete_by_job(self, job_id: uuid.UUID) -> None:
        for item in await self.list_by_job(job_id):
            await self.db.delete(item)
        await self.db.commit()
