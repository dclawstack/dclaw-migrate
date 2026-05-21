import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class OptimizationRecRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    job_id: uuid.UUID
    category: str
    title: str
    description: str
    estimated_savings: Optional[str]
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime


class OptimizationRecUpdate(BaseModel):
    status: Optional[str] = None


class OptimizationRunResponse(BaseModel):
    generated: int
    recommendations: list[OptimizationRecRead]
