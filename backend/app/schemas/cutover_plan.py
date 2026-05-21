import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CutoverPlanCreate(BaseModel):
    strategy: str = "blue-green"
    planned_at: Optional[datetime] = None
    pre_checks: Optional[str] = None
    post_checks: Optional[str] = None
    rollback_procedure: Optional[str] = None
    notes: Optional[str] = None


class CutoverPlanUpdate(BaseModel):
    strategy: Optional[str] = None
    planned_at: Optional[datetime] = None
    pre_checks: Optional[str] = None
    post_checks: Optional[str] = None
    rollback_procedure: Optional[str] = None
    notes: Optional[str] = None


class CutoverPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    job_id: uuid.UUID
    strategy: str
    status: str
    planned_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    rolled_back_at: Optional[datetime]
    pre_checks: Optional[str]
    post_checks: Optional[str]
    rollback_procedure: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
