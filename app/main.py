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

@app.post("/import/excel")
async def import_excel(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Upload an Excel file")
    content = await file.read()
    df = pd.read_excel(io.BytesIO(content))
    # TODO: validate schema (employees, shifts, etc.)
    return {"rows": len(df), "columns": list(df.columns)}
