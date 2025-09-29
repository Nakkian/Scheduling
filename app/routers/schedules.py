from fastapi import APIRouter
from ..schemas.schedule import ScheduleCreate, ScheduleOut
from ..services.scheduling import create_schedule, list_schedules

router = APIRouter(prefix="/schedules", tags=["schedules"])

@router.post("/", response_model=ScheduleOut)
def create(payload: ScheduleCreate):
    return create_schedule(payload)

@router.get("/", response_model=list[ScheduleOut])
def list_all():
    return list_schedules()