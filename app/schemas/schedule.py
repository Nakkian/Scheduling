from pydantic import BaseModel, Field
from typing import Optional

class ScheduleCreate(BaseModel):
    employee_id: int = Field(..., ge=1)
    start_time: str
    end_time: str
    role: Optional[str] = None

class ScheduleOut(ScheduleCreate):
    id: int