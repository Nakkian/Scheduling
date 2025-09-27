from fastapi import FastAPI, UploadFile, File, HTTPException
import io, pandas as pd

app = FastAPI(title="Scheduler API")

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/sum")
def sum_example(a: int, b: int):
    # trivial pandas usage to ensure it works on deploy
    s = pd.Series([a, b]).sum()
    return {"sum": int(s)}

@app.post("/import/excel")
async def import_excel(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Upload an Excel file")
    content = await file.read()
    df = pd.read_excel(io.BytesIO(content))
    # TODO: validate schema (employees, shifts, etc.)
    return {"rows": len(df), "columns": list(df.columns)}
