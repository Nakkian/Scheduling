from fastapi import Depends, Header, HTTPException, status
from .config import settings

async def require_api_key(x_api_key: str | None = Header(default=None)):
    # If no API_KEY configured, allow everything (handy in dev)
    if not settings.api_key:
        return
    if x_api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )
