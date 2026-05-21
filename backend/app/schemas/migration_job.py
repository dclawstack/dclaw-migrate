import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ConnectionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    connection_type: str
    role: str


class MigrationJobCreate(BaseModel):
    name: str
    description: Optional[str] = None
    source_connection_id: Optional[uuid.UUID] = None
    target_connection_id: Optional[uuid.UUID] = None
    migration_type: str = "full_load"
    scheduled_at: Optional[datetime] = None


class MigrationJobUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    source_connection_id: Optional[uuid.UUID] = None
    target_connection_id: Optional[uuid.UUID] = None
    migration_type: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class MigrationJobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    wave_id: Optional[uuid.UUID]
    name: str
    description: Optional[str]
    source_connection_id: Optional[uuid.UUID]
    target_connection_id: Optional[uuid.UUID]
    source_connection: Optional[ConnectionSummary]
    target_connection: Optional[ConnectionSummary]
    migration_type: str
    status: str
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class MigrationJobListResponse(BaseModel):
    items: list[MigrationJobRead]
    total: int
    limit: int
    offset: int
