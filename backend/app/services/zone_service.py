from typing import Optional
import asyncpg


async def get_all_zones(pool: asyncpg.Pool) -> list[dict]:
    """Ambil semua zone aktif dengan 4 corner GPS points."""
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT z.zone_id, z.zone_name, z.area_id,
                   z.latlong_upleft, z.latlong_downleft,
                   z.latlong_upright, z.latlong_downright,
                   z.center_latitude, z.center_longitude, z.is_active
            FROM cms_zone z
            WHERE z.is_active = TRUE
            ORDER BY z.zone_name
            """
        )
    return [_fmt_zone(r) for r in rows]


async def get_zone_by_id(pool: asyncpg.Pool, zone_id: str) -> Optional[dict]:
    """Ambil satu zone berdasarkan zone_id."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT zone_id, zone_name, area_id,
                   latlong_upleft, latlong_downleft,
                   latlong_upright, latlong_downright,
                   center_latitude, center_longitude, is_active
            FROM cms_zone
            WHERE zone_id = $1
            """,
            zone_id,
        )
    return _fmt_zone(row) if row else None


def _fmt_zone(row) -> dict:
    return {
        "zone_id": row["zone_id"],
        "zone_name": row["zone_name"],
        "area_id": row["area_id"],
        "latlong_upleft": row["latlong_upleft"],
        "latlong_downleft": row["latlong_downleft"],
        "latlong_upright": row["latlong_upright"],
        "latlong_downright": row["latlong_downright"],
        "center_latitude": float(row["center_latitude"]) if row["center_latitude"] else None,
        "center_longitude": float(row["center_longitude"]) if row["center_longitude"] else None,
        "is_active": row["is_active"],
    }
