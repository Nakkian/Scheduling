from fastapi import Header, HTTPException, status
from typing import Optional
from .config import settings

def _require_api_key(x_api_key: Optional[str]):
    if not settings.admin_api_key or x_api_key != settings.admin_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing/invalid X-API-Key")

async def require_viewer(authorization: Optional[str] = Header(default=None)):
    """
    Use on READ endpoints.
    none   -> allow
    apikey -> allow
    auth0  -> TODO: enforce Auth0 'read' later (returns 501 for now)
    """
    if settings.auth_mode in ("none", "apikey"):
        return
    if settings.auth_mode == "auth0":
        # Prevent silent bypass until Auth0 is wired
        raise HTTPException(status_code=501, detail="Auth0 mode enabled but not wired yet")

async def require_editor(
    x_api_key: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
):
    """
    Use on WRITE endpoints (import, patch).
    none   -> allow (dev only)
    apikey -> require X-API-Key
    auth0  -> TODO: enforce 'write' permission later
    """
    if settings.auth_mode == "none":
        return
    if settings.auth_mode == "apikey":
        _require_api_key(x_api_key)
        return
    if settings.auth_mode == "auth0":
        raise HTTPException(status_code=501, detail="Auth0 mode enabled but not wired yet")

async def require_scheduler(
    x_api_key: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
):
    #Todo use on API endpoints
    if settings.auth_mode == "none":
        return
    if settings.auth_mode == "apikey":
        _require_api_key(x_api_key)
        return
    if settings.auth_mode == "auth0":
        raise HTTPException(status_code=501, detail="Auth0 mode enabled but not wired yet")
