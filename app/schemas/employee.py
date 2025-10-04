from typing import Optional, Literal
from pydantic import BaseModel, Field

Dept = Literal["ABOVE", "BELOW"]

class EmployeeBase(BaseModel):
    id: int = Field(..., ge=1)
    name: str
    job_code: str
    dept: Optional[Dept] = None
    subsection: Optional[str] = None
    specific_job: Optional[str] = None
    active: bool = True

class EmployeeUpsertIn(EmployeeBase):
    pass

class EmployeeOut(EmployeeBase):
    pass

class SpecificJobUpdate(BaseModel):
    specific_job: Optional[str] = None
