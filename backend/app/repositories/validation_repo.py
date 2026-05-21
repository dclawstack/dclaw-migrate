import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.validation_report import ValidationReport
from app.repositories.base_repo import BaseRepository


class ValidationReportRepository(BaseRepository[ValidationReport]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ValidationReport)

    async def list_by_job(self, job_id: uuid.UUID) -> list[ValidationReport]:
        result = await self.db.execute(
            select(ValidationReport)
            .where(ValidationReport.job_id == job_id)
            .order_by(ValidationReport.created_at.desc())
        )
        return list(result.scalars().all())

    async def delete_by_job(self, job_id: uuid.UUID) -> None:
        items = await self.list_by_job(job_id)
        for item in items:
            await self.db.delete(item)
        await self.db.commit()
