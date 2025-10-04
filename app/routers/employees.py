from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Depends, Request
import io
import pandas as pd

from ..schemas.employee import EmployeeUpsertIn, EmployeeOut, SpecificJobUpdate, Dept
from ..services.employees import upsert_employees, list_employees, set_specific_job
from ..auth import require_api_key  # protects writes
# (optional) from ..audit import audit  # if you added auditing

router = APIRouter(prefix="/employees", tags=["employees"])

# ---- PUBLIC LIST ----
@router.get("/", response_model=list[EmployeeOut])
async def list_all(
    dept: Dept | None = Query(None),
    job_code: str | None = Query(None),
    sort: str = Query("name", pattern="^(name|job_code|id)$"),
):
    return list_employees(dept=dept, job_code=job_code, sort=sort)

# ---- PROTECTED IMPORT ----
@router.post("/import", dependencies=[Depends(require_api_key)])
async def import_employees(
    file: UploadFile = File(...),
    header_row: int | None = Query(None, ge=1),
    skiprows: int | None = Query(None, ge=0),
    sheet_name: str | None = Query(None),
    request: Request | None = None,
):
    name = (file.filename or "").lower()
    content = await file.read()

    def _read_df():
        if name.endswith(".csv"):
            if header_row:  # Excel 1-based → pandas 0-based
                return pd.read_csv(io.BytesIO(content), header=header_row - 1)
            return pd.read_csv(io.BytesIO(content), skiprows=skiprows or 0)
        else:
            if header_row:
                return pd.read_excel(io.BytesIO(content), sheet_name=sheet_name or 0, header=header_row - 1)
            return pd.read_excel(io.BytesIO(content), sheet_name=sheet_name or 0, skiprows=skiprows or 0)

    try:
        df = _read_df()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}")

    # normalize headers
    def norm(s: str) -> str: return (s or "").strip().lower().replace(" ", "_")
    df.columns = [norm(str(c)) for c in df.columns]

    aliases = {
        "employee_id":"id", "emp_id":"id", "id":"id",
        "employee_name":"name", "name":"name",
        "job_code":"job_code", "jobcode":"job_code", "code":"job_code",
        "dept":"dept", "department":"dept",
        "subsection":"subsection",
        "specific_job":"specific_job",
        "active":"active",
    }
    canon = {aliases.get(c, c): c for c in df.columns if aliases.get(c, c)}
    required = {"id","name","job_code"}
    missing = [c for c in required if c not in canon]
    if missing:
        raise HTTPException(status_code=422, detail={"missing_columns": missing, "available": list(df.columns)})

    payloads: list[EmployeeUpsertIn] = []
    for _, row in df.iterrows():
        try:
            payloads.append(EmployeeUpsertIn(
                id=int(row[canon["id"]]),
                name=str(row[canon["name"]]).strip(),
                job_code=str(row[canon["job_code"]]).strip(),
                dept=(str(row[canon["dept"]]).strip().upper() if "dept" in canon and pd.notna(row[canon["dept"]]) else None),
                subsection=(str(row[canon["subsection"]]).strip() if "subsection" in canon and pd.notna(row[canon["subsection"]]) else None),
                specific_job=(str(row[canon["specific_job"]]).strip() if "specific_job" in canon and pd.notna(row[canon["specific_job"]]) else None),
                active=(bool(row[canon["active"]]) if "active" in canon and pd.notna(row[canon["active"]]) else True),
            ))
        except Exception:
            continue

    result = upsert_employees(payloads)

    # optional audit:
    # await audit(request, "IMPORT_EMPLOYEES", "employee", None, None, result, actor=None, success=True)

    return {"result": result}

# ---- PROTECTED PATCH specific_job ONLY ----
@router.patch("/{emp_id}/specific-job", response_model=EmployeeOut, dependencies=[Depends(require_api_key)])
async def update_specific_job(emp_id: int, body: SpecificJobUpdate, request: Request | None = None):
    try:
        out = set_specific_job(emp_id, body.specific_job)
    except KeyError:
        raise HTTPException(status_code=404, detail="Employee not found")
    # optional audit:
    # await audit(request, "UPDATE_EMPLOYEE", "employee", str(emp_id), {"specific_job": None}, out.model_dump(), actor=None, success=True)
    return out
