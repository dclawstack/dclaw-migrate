import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

ASSET_TYPES = ["service", "database", "api", "frontend", "batch", "legacy", "other"]
STRATEGIES = ["lift-and-shift", "replatform", "refactor", "replace", "retire", "retain"]
ASSET_STATUSES = ["pending", "in-progress", "completed", "retired", "blocked"]


class ApplicationAssetCreate(BaseModel):
    name: str
    asset_type: str
    migration_strategy: str = "lift-and-shift"
    current_host: Optional[str] = None
    target_host: Optional[str] = None
    risk_level: str = "medium"
    effort_estimate_days: Optional[int] = None
    notes: Optional[str] = None


class ApplicationAssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[str] = None
    migration_strategy: Optional[str] = None
    current_host: Optional[str] = None
    target_host: Optional[str] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None
    effort_estimate_days: Optional[int] = None
    notes: Optional[str] = None
    containerization_plan: Optional[str] = None
    cloud_strategy: Optional[str] = None


class ApplicationAssetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    asset_type: str
    migration_strategy: str
    current_host: Optional[str]
    target_host: Optional[str]
    status: str
    effort_estimate_days: Optional[int]
    risk_level: str
    notes: Optional[str]
    containerization_plan: Optional[str]
    cloud_strategy: Optional[str]
    created_at: datetime
    updated_at: datetime


class ApplicationAssetListResponse(BaseModel):
    items: list[ApplicationAssetRead]
    total: int
