import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

RUNBOOK_TYPES = ["pre-migration", "cutover", "rollback", "post-migration", "general"]


class RunbookCreate(BaseModel):
    title: str
    runbook_type: str = "general"
    content: str


class RunbookUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class RunbookRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    job_id: uuid.UUID
    title: str
    runbook_type: str
    content: str
    created_at: datetime
    updated_at: datetime


class GenerateRunbookRequest(BaseModel):
    runbook_type: str = "general"
