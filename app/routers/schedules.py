from fastapi import APIRouter, Depends
from ..auth_gate import require_editor, require_scheduler
from ..schemas.schedule import ScheduleCreate, ScheduleOut, AutoScheduleRequest, AutoScheduleResult
from ..services.scheduling import create_schedule, generate_auto

router = APIRouter(prefix="/schedules", tags=["schedules"])

# Manual create (editor)
@router.post("/", response_model=ScheduleOut, dependencies=[Depends(require_editor)])
async def create(payload: ScheduleCreate):
    return await create_schedule(payload)

# Auto-generate (scheduler/editor)
@router.post("/auto", response_model=AutoScheduleResult, dependencies=[Depends(require_scheduler)])
async def auto(payload: AutoScheduleRequest):
    return generate_auto(payload)
