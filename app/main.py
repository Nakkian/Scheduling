from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

app = FastAPI(title="Scheduler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev at home
    ],
    allow_origin_regex=r"https://.*\.app\.github\.dev",  # any Codespace URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/sum")
def sum_example(a: int, b: int):
    # trivial pandas usage to ensure it works on deploy
    s = pd.Series([a, b]).sum()
    return {"sum": int(s)}

REQUIRED = {"shift start date","shift end date","employee id","employee full name","primary job"}

@app.post("/import/excel")
async def import_excel(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Upload an Excel file")
    content = await file.read()
    #this will be the file guard size limit 5MB
    #1024 bytes == 1 KB , then 1024 KB == 1MB then 5MB so == 5 MB * 1024 KB * 1024 B
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(413, "File too large")
    try:
        df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(422, f"Read error: {e}")
    cols = {str(c).strip().lower() for c in df.columns}
    missing = REQUIRED - cols
    if missing:
        raise HTTPException(status_code = 422, detail = {"missing_columns": sorted(missing)})
    return {"rows": len(df), "columns": list(df.columns)}
#todo .POST and employees method
"""@app.post("/employees")
#TODO request json - { "name": "Alice Doe", "role": "barista" }
def employees():
"""
