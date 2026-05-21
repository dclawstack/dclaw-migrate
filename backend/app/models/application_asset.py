from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import UUID, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.core.utils import utc_now


class ApplicationAsset(Base):
    __tablename__ = "application_assets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_type: Mapped[str] = mapped_column(String(50), nullable=False)
    migration_strategy: Mapped[str] = mapped_column(String(50), default="lift-and-shift")
    current_host: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    target_host: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    effort_estimate_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(20), default="medium")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    containerization_plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cloud_strategy: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)
