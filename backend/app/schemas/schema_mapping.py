import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SchemaMappingCreate(BaseModel):
    source_table: str
    target_table: str
    source_column: Optional[str] = None
    target_column: Optional[str] = None
    transform_rule: Optional[str] = None
    is_excluded: bool = False


class SchemaMappingUpdate(BaseModel):
    target_table: Optional[str] = None
    target_column: Optional[str] = None
    transform_rule: Optional[str] = None
    is_excluded: Optional[bool] = None


class SchemaMappingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_id: uuid.UUID
    source_table: str
    target_table: str
    source_column: Optional[str]
    target_column: Optional[str]
    transform_rule: Optional[str]
    is_excluded: bool
    created_at: datetime
    updated_at: datetime


class DiscoverResponse(BaseModel):
    discovered: int
    mappings: list[SchemaMappingRead]
