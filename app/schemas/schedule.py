# app/schemas/schedule.py
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field

Dept = Literal["ABOVE", "BELOW"]

class ScheduleCreate(BaseModel):
    employee_id: int
    dept: Dept
    job_code: str
    start_time: datetime
    end_time: datetime
    specific_job: Optional[str] = None

class ScheduleOut(BaseModel):
    id: int = 0
    employee_id: int
    dept: Dept
    job_code: str
    start_time: datetime
    end_time: datetime
    specific_job: Optional[str] = None

class SlotRequest(BaseModel):
    dept: Dept
    job_code: str
    start_time: datetime
    end_time: datetime
    count: int = Field(ge=1)

class AutoScheduleRequest(BaseModel):
    slots: List[SlotRequest]

class Assignment(BaseModel):
    slot_index: int
    employee_id: int
    start_time: datetime
    end_time: datetime
    specific_job: Optional[str] = None

class AutoScheduleResult(BaseModel):
    assignments: List[Assignment]
    notes: Optional[str] = None

# Back-compat aliases (if old service code expects these)
AutoSlot = SlotRequest
AutoAssignment = Assignment
