from __future__ import annotations
from typing import Optional, Literal
from datetime import datetime
from sqlmodel import SQLModel, Field, Column, JSON

Dept = Literal["ABOVE","BELOW"]

class Employee(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str
    job_code: str
    dept: Optional[Dept] = None
    subsection: Optional[str] = None
    specific_job: Optional[str] = None
    active: bool = True
    version: int = 0                      # optimistic concurrency
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ApiKey(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str                             # “Alicia”, “Ops Console”, etc.
    key_hash: str                         # sha256 hex of the real key
    role: str = "admin"                   # simple RBAC if you need it
    active: bool = True

class AuditLog(SQLModel, table=True):
    id: int = Field(primary_key=True)
    ts: datetime = Field(default_factory=datetime.utcnow)
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    action: str                           # "UPDATE_EMPLOYEE", "IMPORT_EMPLOYEES"
    resource_type: str                    # "employee"
    resource_id: Optional[str] = None
    path: Optional[str] = None
    ip: Optional[str] = None
    before: dict | None = Field(sa_column=Column(JSON))
    after: dict | None  = Field(sa_column=Column(JSON))
    success: bool = True
    note: Optional[str] = None
