import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ValidationReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_id: uuid.UUID
    table_name: str
    source_row_count: int
    target_row_count: int
    checksum_match: bool
    sample_mismatches: int
    status: str
    detail: Optional[str]
    created_at: datetime


class ValidationRunResponse(BaseModel):
    validated_tables: int
    passed: int
    failed: int
    reports: list[ValidationReportRead]
