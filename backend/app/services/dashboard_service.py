import asyncpg
from datetime import date


async def get_stats(pool: asyncpg.Pool) -> dict:
    """Kalkulasi statistik utama dashboard."""
    async with pool.acquire() as conn:
        total_containers = await conn.fetchval(
            "SELECT COUNT(*) FROM cms_container WHERE status = 'IN_YARD'"
        )
        total_zones = await conn.fetchval(
            "SELECT COUNT(*) FROM cms_zone WHERE is_active = TRUE"
        )
        used_zones = await conn.fetchval(
            "SELECT COUNT(DISTINCT zone_id) FROM cms_container WHERE status = 'IN_YARD'"
        )
        avg_stack_row = await conn.fetchrow(
            """
            SELECT ROUND(AVG(zone_count)::numeric, 2) as avg_stack
            FROM (
                SELECT zone_id, COUNT(*) as zone_count
                FROM cms_container
                WHERE status = 'IN_YARD'
                GROUP BY zone_id
            ) sub
            """
        )

    total_zones_int = int(total_zones or 0)
    used_zones_int = int(used_zones or 0)
    empty_zones = total_zones_int - used_zones_int
    space_pct = round((used_zones_int / total_zones_int * 100), 1) if total_zones_int > 0 else 0.0
    avg_stack = float(avg_stack_row["avg_stack"]) if avg_stack_row["avg_stack"] else 0.0

    return {
        "total_containers": int(total_containers or 0),
        "total_zones": total_zones_int,
        "used_zones": used_zones_int,
        "empty_zones": empty_zones,
        "space_usage_percent": space_pct,
        "average_stack": avg_stack,
        "device_status": "connected",
    }


async def get_movement_logs(pool: asyncpg.Pool, limit: int = 20) -> list[dict]:
    """Ambil history pergerakan container, terbaru di atas."""
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                h.moved_at,
                h.operator,
                h.container_number,
                COALESCE(fz.zone_name, h.from_zone_id, '-') AS from_location,
                COALESCE(tz.zone_name, h.to_zone_id, '-') AS to_location
            FROM cms_history h
            LEFT JOIN cms_zone fz ON fz.zone_id = h.from_zone_id
            LEFT JOIN cms_zone tz ON tz.zone_id = h.to_zone_id
            ORDER BY h.moved_at DESC
            LIMIT $1
            """,
            limit,
        )

    return [
        {
            "time": r["moved_at"].strftime("%d %b %Y %H:%M"),
            "operator": r["operator"] or "System",
            "container": r["container_number"],
            "from": r["from_location"],
            "to": r["to_location"],
        }
        for r in rows
    ]


async def get_chart_data(pool: asyncpg.Pool, year: int) -> list[dict]:
    """
    Jumlah container yang masuk (yard_in_date) per bulan dalam 1 tahun.
    Bulan yang kosong tetap ditampilkan dengan count=0.
    """
    MONTH_LABELS = {
        1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
        5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
        9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
    }
    year_suffix = str(year)[2:]  # e.g. "24"

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                EXTRACT(MONTH FROM yard_in_date)::int AS month,
                COUNT(*)::int AS count
            FROM cms_container
            WHERE EXTRACT(YEAR FROM yard_in_date) = $1
            GROUP BY month
            ORDER BY month
            """,
            float(year),
        )

    month_counts: dict[int, int] = {r["month"]: r["count"] for r in rows}

    return [
        {
            "date": f"{MONTH_LABELS[m]} {year_suffix}",
            "count": month_counts.get(m, 0),
        }
        for m in range(1, 13)
    ]
