import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.application_asset import ApplicationAsset
from app.repositories.asset_repo import ApplicationAssetRepository
from app.schemas.application_asset import (
    ApplicationAssetCreate,
    ApplicationAssetListResponse,
    ApplicationAssetRead,
    ApplicationAssetUpdate,
)

router = APIRouter()


@router.get("", response_model=ApplicationAssetListResponse)
async def list_assets(limit: int = 20, offset: int = 0, db: AsyncSession = Depends(get_db)):
    repo = ApplicationAssetRepository(db)
    items, total = await repo.list_all(limit=limit, offset=offset)
    return ApplicationAssetListResponse(items=items, total=total)


@router.post("", response_model=ApplicationAssetRead, status_code=201)
async def create_asset(payload: ApplicationAssetCreate, db: AsyncSession = Depends(get_db)):
    repo = ApplicationAssetRepository(db)
    obj = ApplicationAsset(**payload.model_dump())
    return await repo.create(obj)


@router.get("/{asset_id}", response_model=ApplicationAssetRead)
async def get_asset(asset_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ApplicationAssetRepository(db)
    obj = await repo.get_by_id(asset_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset not found")
    return obj


@router.put("/{asset_id}", response_model=ApplicationAssetRead)
async def update_asset(
    asset_id: uuid.UUID, payload: ApplicationAssetUpdate, db: AsyncSession = Depends(get_db)
):
    repo = ApplicationAssetRepository(db)
    obj = await repo.get_by_id(asset_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset not found")
    return await repo.update(obj, payload.model_dump(exclude_unset=True))


@router.delete("/{asset_id}", status_code=204)
async def delete_asset(asset_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = ApplicationAssetRepository(db)
    obj = await repo.get_by_id(asset_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Asset not found")
    await repo.delete(obj)
