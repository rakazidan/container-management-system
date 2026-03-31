from typing import Optional
import asyncpg

# Common SELECT fragment reused across queries
_CONTAINER_SELECT = """
    SELECT
        c.container_id,
        c.container_number,
        c.agent_id,
        sa.agent_name,
        c.zone_id,
        z.zone_name,
        z.center_latitude,
        z.center_longitude,
        c.stack_level,
        c.yard_in_date,
        c.yard_out_date,
        c.status
    FROM cms_container c
    JOIN cms_zone z ON c.zone_id = z.zone_id
    JOIN cms_shipping_agent sa ON c.agent_id = sa.agent_id
"""


async def get_containers(
    pool: asyncpg.Pool,
    zone_id: Optional[str],
    agent_id: Optional[str],
    status: Optional[str],
    page: int,
    limit: int,
) -> dict:
    """Ambil list containers dengan filter opsional dan pagination."""
    conditions = []
    params: list = []

    if zone_id:
        params.append(zone_id)
        conditions.append(f"c.zone_id = ${len(params)}")
    if agent_id:
        params.append(agent_id)
        conditions.append(f"c.agent_id = ${len(params)}")
    if status:
        params.append(status)
        conditions.append(f"c.status = ${len(params)}")

    where = "WHERE " + " AND ".join(conditions) if conditions else ""
    offset = (page - 1) * limit

    params.extend([limit, offset])
    query = f"{_CONTAINER_SELECT} {where} ORDER BY c.zone_id, c.stack_level LIMIT ${len(params)-1} OFFSET ${len(params)}"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        # total count
        count_query = f"SELECT COUNT(*) FROM cms_container c {where}"
        total = await conn.fetchval(count_query, *params[:-2])

    return {
        "status": "success",
        "data": [_fmt_container(r) for r in rows],
        "total": total,
        "page": page,
        "limit": limit,
    }


async def get_containers_grouped(pool: asyncpg.Pool) -> dict:
    """
    Ambil containers aktif dan group berdasarkan zone.
    1 zone = 1 stack position.
    """
    query = f"""
        {_CONTAINER_SELECT}
        WHERE c.status = 'IN_YARD'
        ORDER BY c.zone_id, c.stack_level
    """

    async with pool.acquire() as conn:
        rows = await conn.fetch(query)

        # Count total zones for empty_zones calculation
        total_zones = await conn.fetchval("SELECT COUNT(*) FROM cms_zone WHERE is_active = TRUE")

    # Group by zone in Python (maintains sort order)
    zone_map: dict = {}
    for r in rows:
        zid = r["zone_id"]
        if zid not in zone_map:
            zone_map[zid] = {
                "id": f"stack-{zid}",
                "zone_id": zid,
                "zone_name": r["zone_name"],
                "gps_coordinate": {
                    "latitude": float(r["center_latitude"] or 0),
                    "longitude": float(r["center_longitude"] or 0),
                },
                "total_stacks": 0,
                "rotation": 0,
                "containers": [],
            }
        zone_map[zid]["containers"].append({
            "id": r["container_id"],
            "container_number": r["container_number"],
            "shipping_agent": r["agent_name"],
            "agent_id": r["agent_id"],
            "stack_level": r["stack_level"],
            "yard_in_date": r["yard_in_date"].strftime("%Y-%m-%d %H:%M:%S"),
            "zone_id": r["zone_id"],
            "zone_name": r["zone_name"],
        })
        zone_map[zid]["total_stacks"] += 1

    groups = list(zone_map.values())
    total_containers = sum(g["total_stacks"] for g in groups)
    used_zones = len(groups)

    return {
        "status": "success",
        "data": groups,
        "total_groups": used_zones,
        "total_containers": total_containers,
        "empty_zones": int(total_zones) - used_zones,
    }


async def search_container(
    pool: asyncpg.Pool,
    container_number: Optional[str],
    shipping_agent: Optional[str],
) -> Optional[dict]:
    """Search container; return None jika tidak ditemukan."""
    conditions = ["c.status = 'IN_YARD'"]
    params: list = []

    if container_number:
        params.append(container_number)
        conditions.append(f"LOWER(c.container_number) = LOWER(${len(params)})")
    if shipping_agent:
        params.append(f"%{shipping_agent}%")
        conditions.append(f"LOWER(sa.agent_name) LIKE LOWER(${len(params)})")

    where = "WHERE " + " AND ".join(conditions)
    query = f"{_CONTAINER_SELECT} {where} LIMIT 1"

    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *params)
        if not row:
            return None

        # Get all containers in the same stack/zone
        stack_rows = await conn.fetch(
            """
            SELECT c.container_number, c.stack_level, sa.agent_name
            FROM cms_container c
            JOIN cms_shipping_agent sa ON c.agent_id = sa.agent_id
            WHERE c.zone_id = $1 AND c.status = 'IN_YARD'
            ORDER BY c.stack_level
            """,
            row["zone_id"],
        )

    return {
        "zone_id": row["zone_id"],
        "zone_name": row["zone_name"],
        "gps_coordinate": {
            "latitude": float(row["center_latitude"] or 0),
            "longitude": float(row["center_longitude"] or 0),
        },
        "container": {
            "id": row["container_id"],
            "container_number": row["container_number"],
            "shipping_agent": row["agent_name"],
            "agent_id": row["agent_id"],
            "stack_level": row["stack_level"],
            "yard_in_date": row["yard_in_date"].strftime("%Y-%m-%d %H:%M:%S"),
            "zone_id": row["zone_id"],
            "zone_name": row["zone_name"],
        },
        "stack_info": {
            "total_stacks": len(stack_rows),
            "containers_in_stack": [
                {
                    "container_number": s["container_number"],
                    "stack_level": s["stack_level"],
                    "shipping_agent": s["agent_name"],
                }
                for s in stack_rows
            ],
        },
    }


async def get_container_by_id(pool: asyncpg.Pool, container_id: str) -> Optional[dict]:
    """Ambil detail container by ID."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            f"{_CONTAINER_SELECT} WHERE c.container_id = $1", container_id
        )
    return _fmt_container(row) if row else None


def _fmt_container(r) -> dict:
    return {
        "container_id": r["container_id"],
        "container_number": r["container_number"],
        "agent_id": r["agent_id"],
        "shipping_agent": r["agent_name"],
        "zone_id": r["zone_id"],
        "zone_name": r["zone_name"],
        "stack_level": r["stack_level"],
        "yard_in_date": r["yard_in_date"].strftime("%Y-%m-%d %H:%M:%S"),
        "yard_out_date": r["yard_out_date"].strftime("%Y-%m-%d %H:%M:%S") if r["yard_out_date"] else None,
        "status": r["status"],
        "gps_coordinate": {
            "latitude": float(r["center_latitude"] or 0),
            "longitude": float(r["center_longitude"] or 0),
        },
    }
