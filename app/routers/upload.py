from fastapi import APIRouter, File, UploadFile, HTTPException
from ..deps import missing_columns_error
import io
import pandas as pd

router = APIRouter(prefix="/upload", tags=["upload"])

REQUIRED_COLUMNS = {"id", "name", "role"}

@router.post("/employees")
async def upload_employees(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    if not filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .csv, .xlsx, .xls are allowed")

    content = await file.read()
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {e}")

    cols = set(map(str, df.columns))
    missing = REQUIRED_COLUMNS - cols
    if missing:
        missing_columns_error(missing)

    sample = df.head(10).to_dict(orient="records")
    return {"rows": len(df), "columns": sorted(cols), "sample": sample}