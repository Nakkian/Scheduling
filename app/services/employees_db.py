from typing import Iterable, Optional, Tuple
from sqlalchemy import select
from sqlmodel import col
from ..schemas.employee import EmployeeUpsertIn, EmployeeOut, Dept
from ..models import Employee
from ..db import SessionLocal
from datetime import datetime

def infer_dept_and_subsection(job_code: str) -> Tuple[Optional[Dept], Optional[str]]:
    jc = (job_code or "").upper()
    if any(k in jc for k in ("CS","AGT","GATE","ABV","ABOVE")): return "ABOVE", None
    if any(k in jc for k in ("RAMP","BAG","BEL","LOAD","OPS","RD","RW","BELOW")): return "BELOW", None
    return None, None

async def upsert_employees(records: Iterable[EmployeeUpsertIn]) -> dict:
    created = updated = 0
    async with SessionLocal() as session:
        # Preload existing ids in one query (optional optimization)
        ids = [r.id for r in records]
        existing_rows = {}
        if ids:
            res = await session.exec(select(Employee).where(col(Employee.id).in_(ids)))
            existing_rows = {e.id: e for e in res.all()}

        for r in records:
            dept, subsection = r.dept, r.subsection
            if dept is None:
                idept, isub = infer_dept_and_subsection(r.job_code)
                dept = dept or idept
                subsection = subsection or isub

            row = existing_rows.get(r.id)
            if row:
                # preserve existing specific_job unless explicitly provided
                row.name = r.name
                row.job_code = r.job_code
                row.dept = dept
                row.subsection = subsection
                row.specific_job = r.specific_job if r.specific_job is not None else row.specific_job
                row.active = r.active
                row.updated_at = datetime.utcnow()
                updated += 1
            else:
                row = Employee(
                    id=r.id, name=r.name, job_code=r.job_code,
                    dept=dept, subsection=subsection,
                    specific_job=r.specific_job, active=r.active
                )
                session.add(row)
                created += 1
        await session.commit()

    total = await count_employees()
    return {"created": created, "updated": updated, "total": total}

async def count_employees() -> int:
    async with SessionLocal() as session:
        res = await session.exec(select(Employee))
        return len(res.all())

async def list_employees(dept: Optional[Dept] = None, job_code: Optional[str] = None, sort: str = "name") -> list[EmployeeOut]:
    async with SessionLocal() as session:
        stmt = select(Employee)
        if dept:
            stmt = stmt.where(Employee.dept == dept)
        if job_code:
            j = job_code.upper()
            # naive contains on job_code
            stmt = stmt.where(Employee.job_code.ilike(f"%{j}%"))
        if sort == "name":
            stmt = stmt.order_by(Employee.name)
        elif sort == "job_code":
            stmt = stmt.order_by(Employee.job_code)
        elif sort == "id":
            stmt = stmt.order_by(Employee.id)
        res = await session.exec(stmt)
        rows = res.all()
        return [EmployeeOut(**r.model_dump()) for r in rows]

async def set_specific_job(emp_id: int, specific_job: Optional[str]) -> EmployeeOut:
    async with SessionLocal() as session:
        row = await session.get(Employee, emp_id)
        if not row:
            raise KeyError(emp_id)
        # safeguard: do NOT touch job_code here
        row.specific_job = specific_job
        row.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(row)
        return EmployeeOut(**row.model_dump())
