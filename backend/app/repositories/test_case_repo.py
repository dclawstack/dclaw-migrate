import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.test_case import TestCase
from app.repositories.base_repo import BaseRepository


class TestCaseRepository(BaseRepository[TestCase]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, TestCase)

    async def update(self, obj: TestCase, data: dict) -> TestCase:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def list_by_job(self, job_id: uuid.UUID) -> list[TestCase]:
        result = await self.db.execute(
            select(TestCase).where(TestCase.job_id == job_id).order_by(TestCase.created_at)
        )
        return list(result.scalars().all())

    async def delete_by_job(self, job_id: uuid.UUID) -> None:
        for item in await self.list_by_job(job_id):
            await self.db.delete(item)
        await self.db.commit()
