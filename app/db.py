# app/db.py
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = "sqlite+aiosqlite:///./data.db"  # set to env later
engine = create_async_engine(DATABASE_URL, future=True, echo=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
