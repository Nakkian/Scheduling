import hashlib, secrets
from typing import Optional
from fastapi import Depends, Header, HTTPException, Request, status
from sqlmodel import select
from .db import SessionLocal
from .models import ApiKey

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

async def resolve_api_key(x_api_key: Optional[str] = Header(default=None)) -> Optional[ApiKey]:
    # No header? unauthenticated (OK for public GETs)
    if not x_api_key: return None
    async with SessionLocal() as session:
        key_hash = sha256_hex(x_api_key)
        res = await session.exec(select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.active == True))
        return res.first()

async def require_api_key(api_key: Optional[str] = Header(default=None)) -> ApiKey:
    if not api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing X-API-Key")
    async with SessionLocal() as session:
        key_hash = sha256_hex(api_key)
        res = await session.exec(select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.active == True))
        row = res.first()
        if not row:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
        return row
