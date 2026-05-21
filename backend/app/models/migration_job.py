from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import UUID, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.core.utils import utc_now

if TYPE_CHECKING:
    from app.models.connection import Connection
    from app.models.migration_wave import MigrationWave


class MigrationJob(Base):
    __tablename__ = "migration_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_connection_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("connections.id", ondelete="SET NULL"), nullable=True
    )
    target_connection_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("connections.id", ondelete="SET NULL"), nullable=True
    )
    wave_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("migration_waves.id", ondelete="SET NULL"), nullable=True
    )
    migration_type: Mapped[str] = mapped_column(String(20), default="full_load")
    status: Mapped[str] = mapped_column(String(20), default="draft")
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now)

    wave: Mapped[Optional[MigrationWave]] = relationship(
        "MigrationWave", back_populates="jobs", lazy="selectin"
    )
    source_connection: Mapped[Optional[Connection]] = relationship(
        "Connection",
        foreign_keys=[source_connection_id],
        back_populates="source_jobs",
        lazy="selectin",
    )
    target_connection: Mapped[Optional[Connection]] = relationship(
        "Connection",
        foreign_keys=[target_connection_id],
        back_populates="target_jobs",
        lazy="selectin",
    )
