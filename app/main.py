import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import health, upload, schedules, employees, employees_export
from .db import init_db

app = FastAPI(title=settings.app_name)

@app.on_event("startup")
async def _startup():
    await init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin] if settings.frontend_origin else [],
    allow_credentials=False,
    allow_methods=["GET","POST","PATCH","OPTIONS"],
    allow_headers=["Content-Type","Authorization","X-API-Key"],
)

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(upload.router, prefix=settings.api_prefix)
app.include_router(schedules.router, prefix=settings.api_prefix)
app.include_router(employee.router, prefix=setting.api_prefix)
app.include_router(employee_exports.router, prefix=setting.api_prefix)
logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))

@app.get("/")
def root():
    return {"message": "Scheduling API up", "prefix": settings.api_prefix}
