import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.migration_wave import MigrationWave
from app.repositories.base_repo import BaseRepository


class MigrationWaveRepository(BaseRepository[MigrationWave]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, MigrationWave)

    async def update(self, obj: MigrationWave, data: dict) -> MigrationWave:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def list_ordered(self) -> list[MigrationWave]:
        result = await self.db.execute(
            select(MigrationWave).order_by(MigrationWave.sequence_order)
        )
        return list(result.scalars().all())
