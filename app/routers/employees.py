from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Depends, Request
import io, pandas as pd
from ..schemas.employee import EmployeeUpsertIn, EmployeeOut, SpecificJobUpdate, Dept
from ..auth import require_api_key
from ..services import employees_db as svc   # <-- switch to DB service

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/", response_model=list[EmployeeOut])
async def list_all(
    dept: Dept | None = Query(None),
    job_code: str | None = Query(None),
    sort: str = Query("name", pattern="^(name|job_code|id)$"),
):
    return await svc.list_employees(dept=dept, job_code=job_code, sort=sort)

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
            return pd.read_csv(io.BytesIO(content), header=(header_row - 1) if header_row else "infer", skiprows=(skiprows or 0) if not header_row else None)
        return pd.read_excel(io.BytesIO(content), sheet_name=sheet_name or 0, header=(header_row - 1) if header_row else 0, skiprows=(skiprows or 0) if not header_row else None)

    try:
        df = _read_df()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}")

    def norm(s: str) -> str: return (s or "").strip().lower().replace(" ", "_")
    df.columns = [norm(str(c)) for c in df.columns]

    aliases = {"employee_id":"id","emp_id":"id","id":"id","employee_name":"name","name":"name","job_code":"job_code","jobcode":"job_code","code":"job_code","dept":"dept","department":"dept","subsection":"subsection","specific_job":"specific_job","active":"active"}
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

    result = await svc.upsert_employees(payloads)
    return {"result": result}

@router.patch("/{emp_id}/specific-job", response_model=EmployeeOut, dependencies=[Depends(require_api_key)])
async def update_specific_job(emp_id: int, body: SpecificJobUpdate):
    try:
        return await svc.set_specific_job(emp_id, body.specific_job)
    except KeyError:
        raise HTTPException(status_code=404, detail="Employee not found")
