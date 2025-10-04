from fastapi import APIRouter, Depends
from ..auth import require_api_key

router = APIRouter(
    prefix="/employees",
    tags=["employees"],
    dependencies=[Depends(require_api_key)]   # <-- all endpoints in this file now require key
)
