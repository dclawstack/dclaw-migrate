import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schema_mapping import SchemaMapping
from app.repositories.base_repo import BaseRepository


class SchemaMappingRepository(BaseRepository[SchemaMapping]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, SchemaMapping)

    async def update(self, obj: SchemaMapping, data: dict) -> SchemaMapping:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def list_by_job(self, job_id: uuid.UUID) -> tuple[list[SchemaMapping], int]:
        result = await self.db.execute(
            select(SchemaMapping).where(SchemaMapping.job_id == job_id).order_by(
                SchemaMapping.source_table, SchemaMapping.source_column
            )
        )
        items = list(result.scalars().all())
        return items, len(items)

    async def delete_by_job(self, job_id: uuid.UUID) -> int:
        items, _ = await self.list_by_job(job_id)
        for item in items:
            await self.db.delete(item)
        await self.db.commit()
        return len(items)
