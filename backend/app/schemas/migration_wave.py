import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class WaveJobSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    status: str
    migration_type: str


class MigrationWaveCreate(BaseModel):
    name: str
    sequence_order: int = 1
    description: Optional[str] = None
    risk_level: str = "medium"


class MigrationWaveUpdate(BaseModel):
    name: Optional[str] = None
    sequence_order: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None


class MigrationWaveRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    sequence_order: int
    description: Optional[str]
    status: str
    risk_level: str
    jobs: list[WaveJobSummary]
    created_at: datetime
    updated_at: datetime


class AssignJobRequest(BaseModel):
    job_id: uuid.UUID
