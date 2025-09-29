from typing import List
from ..schemas.schedule import ScheduleCreate, ScheduleOut

_DB: list[ScheduleOut] = []
_NEXT_ID = 1

def create_schedule(payload: ScheduleCreate) -> ScheduleOut:
    global _NEXT_ID
    out = ScheduleOut(id=_NEXT_ID, **payload.model_dump())
    _DB.append(out)
    _NEXT_ID += 1
    return out

def list_schedules() -> List[ScheduleOut]:
    return _DB