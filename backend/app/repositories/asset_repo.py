from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application_asset import ApplicationAsset
from app.repositories.base_repo import BaseRepository


class ApplicationAssetRepository(BaseRepository[ApplicationAsset]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ApplicationAsset)

    async def update(self, obj: ApplicationAsset, data: dict) -> ApplicationAsset:
        for key, value in data.items():
            setattr(obj, key, value)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj
