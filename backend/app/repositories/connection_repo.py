from sqlalchemy.ext.asyncio import AsyncSession

from app.models.connection import Connection
from app.repositories.base_repo import BaseRepository


class ConnectionRepository(BaseRepository[Connection]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Connection)

    async def update(self, obj: Connection, data: dict) -> Connection:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj
