import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ExecutionLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_id: uuid.UUID
    level: str
    message: str
    rows_processed: Optional[int]
    created_at: datetime


class ExecutionLogListResponse(BaseModel):
    items: list[ExecutionLogRead]
    total: int
