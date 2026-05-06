import uuid
import random
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PlanIn(BaseModel):
    source: str
    target: str


class MigrationPlan(BaseModel):
    id: str
    source: str
    target: str
    complexity_score: int
    estimated_downtime_hours: float
    risk_items: list[str]
    cost_estimate: int
    created_at: str


@router.post("/plans")
async def create_plan(plan_in: PlanIn) -> MigrationPlan:
    return MigrationPlan(
        id=str(uuid.uuid4()),
        source=plan_in.source,
        target=plan_in.target,
        complexity_score=random.randint(1, 100),
        estimated_downtime_hours=round(random.uniform(0.5, 8.0), 1),
        risk_items=["Schema incompatibility"],
        cost_estimate=random.randint(1000, 50000),
        created_at=datetime.utcnow().isoformat(),
    )


@router.get("/plans/{plan_id}/checklist")
async def get_checklist(plan_id: str):
    return {
        "plan_id": plan_id,
        "items": [
            {"step": 1, "task": "Backup source database", "completed": False},
            {"step": 2, "task": "Validate schema compatibility", "completed": False},
            {"step": 3, "task": "Configure target environment", "completed": False},
            {"step": 4, "task": "Run data migration", "completed": False},
            {"step": 5, "task": "Verify data integrity", "completed": False},
            {"step": 6, "task": "Switch traffic to target", "completed": False},
        ],
    }
