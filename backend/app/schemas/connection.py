import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ConnectionCreate(BaseModel):
    name: str
    connection_type: str
    role: str
    host: str
    port: int
    database_name: str
    username: str
    password_secret: str
    ssl_enabled: bool = False


class ConnectionUpdate(BaseModel):
    name: Optional[str] = None
    connection_type: Optional[str] = None
    role: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None
    password_secret: Optional[str] = None
    ssl_enabled: Optional[bool] = None


class ConnectionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    connection_type: str
    role: str
    host: str
    port: int
    database_name: str
    username: str
    ssl_enabled: bool
    status: str
    last_tested_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class ConnectionListResponse(BaseModel):
    items: list[ConnectionRead]
    total: int
    limit: int
    offset: int
