import asyncpg
import json
from app.config import settings

pool: asyncpg.Pool | None = None


async def create_pool() -> None:
    """Initialize the asyncpg connection pool."""
    global pool

    async def init_connection(conn: asyncpg.Connection) -> None:
        """Register JSON/JSONB codecs for each connection."""
        await conn.set_type_codec(
            "jsonb",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )
        await conn.set_type_codec(
            "json",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )

    pool = await asyncpg.create_pool(
        settings.database_url,
        min_size=2,
        max_size=10,
        init=init_connection,
    )
    print("✅ Database pool created")


async def close_pool() -> None:
    """Close the asyncpg connection pool."""
    global pool
    if pool:
        await pool.close()
        print("🔴 Database pool closed")


def get_pool() -> asyncpg.Pool:
    """Return the active pool (raises if not initialized)."""
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    return pool
