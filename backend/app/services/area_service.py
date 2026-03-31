import asyncpg


async def get_all_areas(pool: asyncpg.Pool) -> list[dict]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT area_id, area_name FROM cms_area ORDER BY area_name"
        )
    return [dict(r) for r in rows]
