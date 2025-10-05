# app/models.py
from __future__ import annotations
from typing import Optional
from enum import Enum
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Enum as SAEnum  # optional, SQLModel can infer

class DeptEnum(str, Enum):
    ABOVE = "ABOVE"
    BELOW = "BELOW"

class Employee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    # Use Enum type instead of Literal
    dept: Optional[DeptEnum] = Field(default=None)  # SQLModel maps to Enum
    job_code: str
    specific_job: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# (If you have other models, ensure all enum-ish fields use real Enum classes)
