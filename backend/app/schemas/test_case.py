import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TestCaseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    job_id: uuid.UUID
    name: str
    description: Optional[str]
    test_type: str
    query_source: Optional[str]
    query_target: Optional[str]
    expected_result: Optional[str]
    actual_result: Optional[str]
    status: str
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime


class TestCaseUpdate(BaseModel):
    status: Optional[str] = None
    actual_result: Optional[str] = None
    error_message: Optional[str] = None


class TestRunResponse(BaseModel):
    total: int
    passed: int
    failed: int
    skipped: int
    cases: list[TestCaseRead]
