from typing import Iterable, Optional, Tuple
from ..schemas.employee import EmployeeUpsertIn, EmployeeOut, Dept

# simple in-memory store for now
_EMP_DB: dict[int, EmployeeOut] = {}

def infer_dept_and_subsection(job_code: str) -> Tuple[Optional[Dept], Optional[str]]:
    jc = (job_code or "").upper()
    if any(k in jc for k in ("CS", "AGT", "GATE", "ABV", "ABOVE")):
        return "ABOVE", None
    if any(k in jc for k in ("RAMP", "BAG", "BEL", "LOAD", "OPS", "RD", "RW", "BELOW")):
        return "BELOW", None
    return None, None

def upsert_employees(records: Iterable[EmployeeUpsertIn]) -> dict:
    created = updated = 0
    for r in records:
        dept, subsection = r.dept, r.subsection
        if dept is None:
            idept, isub = infer_dept_and_subsection(r.job_code)
            dept = dept or idept
            subsection = subsection or isub

        existing = _EMP_DB.get(r.id)
        if existing:
            # DO NOT overwrite specific_job unless explicitly provided
            specific_job = r.specific_job if r.specific_job is not None else existing.specific_job
            _EMP_DB[r.id] = EmployeeOut(**{
                "id": r.id, "name": r.name, "job_code": r.job_code,
                "dept": dept, "subsection": subsection,
                "specific_job": specific_job, "active": r.active
            })
            updated += 1
        else:
            _EMP_DB[r.id] = EmployeeOut(**{
                "id": r.id, "name": r.name, "job_code": r.job_code,
                "dept": dept, "subsection": subsection,
                "specific_job": r.specific_job, "active": r.active
            })
            created += 1
    return {"created": created, "updated": updated, "total": len(_EMP_DB)}

def list_employees(dept: Optional[Dept] = None, job_code: Optional[str] = None, sort: str = "name") -> list[EmployeeOut]:
    data = list(_EMP_DB.values())
    if dept:
        data = [e for e in data if e.dept == dept]
    if job_code:
        j = job_code.upper()
        data = [e for e in data if j in e.job_code.upper()]
    if sort == "name":
        data.sort(key=lambda e: e.name.lower())
    elif sort == "job_code":
        data.sort(key=lambda e: e.job_code)
    elif sort == "id":
        data.sort(key=lambda e: e.id)
    return data

def set_specific_job(emp_id: int, specific_job: Optional[str]) -> EmployeeOut:
    if emp_id not in _EMP_DB:
        raise KeyError(emp_id)
    e = _EMP_DB[emp_id]
    _EMP_DB[emp_id] = EmployeeOut(**{**e.model_dump(), "specific_job": specific_job})
    return _EMP_DB[emp_id]
