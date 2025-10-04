from fastapi import Request
from .db import SessionLocal
from .models import AuditLog, ApiKey

async def audit(
    request: Request,
    action: str,
    resource_type: str,
    resource_id: str | None,
    before: dict | None,
    after: dict | None,
    actor: ApiKey | None,
    success: bool = True,
    note: str | None = None,
):
    async with SessionLocal() as session:
        log = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id is not None else None,
            before=before,
            after=after,
            actor_id=actor.id if actor else None,
            actor_name=actor.name if actor else None,
            ip=request.client.host if request and request.client else None,
            path=str(request.url.path) if request else None,
            success=success,
            note=note,
        )
        session.add(log)
        await session.commit()
