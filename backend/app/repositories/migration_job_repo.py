from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.migration_job import MigrationJob
from app.repositories.base_repo import BaseRepository


class MigrationJobRepository(BaseRepository[MigrationJob]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, MigrationJob)

    async def update(self, obj: MigrationJob, data: dict) -> MigrationJob:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def count_by_status(self, status: str) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(MigrationJob).where(MigrationJob.status == status)
        )
        return result.scalar() or 0

    async def list_recent(self, limit: int = 5) -> list[MigrationJob]:
        from sqlalchemy import desc
        result = await self.db.execute(
            select(MigrationJob).order_by(desc(MigrationJob.created_at)).limit(limit)
        )
        return list(result.scalars().all())
