from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.auth import require_auth
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import health
from app.api.v1 import (
    connections, jobs, dashboard,
    mappings, logs, ai, validations,
    waves, assets, test_cases, cutover, optimization, runbooks,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_auth = [Depends(require_auth)]

# Core
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(connections.router, prefix="/api/v1/connections", tags=["connections"], dependencies=_auth)
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"], dependencies=_auth)
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"], dependencies=_auth)

# Job sub-resources
app.include_router(mappings.router, prefix="/api/v1/jobs", tags=["mappings"], dependencies=_auth)
app.include_router(logs.router, prefix="/api/v1/jobs", tags=["logs"], dependencies=_auth)
app.include_router(validations.router, prefix="/api/v1/jobs", tags=["validations"], dependencies=_auth)
app.include_router(test_cases.router, prefix="/api/v1/jobs", tags=["test-cases"], dependencies=_auth)
app.include_router(cutover.router, prefix="/api/v1/jobs", tags=["cutover"], dependencies=_auth)
app.include_router(optimization.router, prefix="/api/v1/jobs", tags=["optimization"], dependencies=_auth)
app.include_router(runbooks.router, prefix="/api/v1/jobs", tags=["runbooks"], dependencies=_auth)

# P0.3 Waves
app.include_router(waves.router, prefix="/api/v1/waves", tags=["waves"], dependencies=_auth)

# P0.2 Assets
app.include_router(assets.router, prefix="/api/v1/assets", tags=["assets"], dependencies=_auth)

# AI
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"], dependencies=_auth)
