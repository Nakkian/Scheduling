from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from io import StringIO
from sqlalchemy import select
from ..db import SessionLocal
from ..models import Employee
import csv

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/export.csv")
async def export_employees_csv():
    async with SessionLocal() as s:
        res = await s.exec(select(Employee))
        rows = res.all()
    buf = StringIO()
    w = csv.writer(buf)
    w.writerow(["id","name","job_code","dept","subsection","specific_job","active","updated_at"])
    for e in rows:
        w.writerow([e.id, e.name, e.job_code, e.dept or "", e.subsection or "", e.specific_job or "", e.active, e.updated_at.isoformat()])
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition":"attachment; filename=employees_export.csv"}
    )
