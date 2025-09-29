from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/ping")
def ping():
    return {"status": "ok"}

@router.get("/info")
def info():
    return {"name": settings.app_name, "env": settings.app_env}