"""
Yard Configuration Service
Handle yard boundary settings for GPS-based container tracking

Updated to use 2-table structure:
- cms_yard_config: Main yard configuration
- cms_yard_polygon_point: Individual polygon points (1 row = 1 point)
"""
import asyncpg
from typing import Optional, List


async def get_active_yard(pool: asyncpg.Pool) -> Optional[dict]:
    """
    Get the currently active yard configuration with all polygon points.
    Returns yard config with polygon_points as array of ordered coordinates.
    """
    async with pool.acquire() as conn:
        # Get yard config
        yard_row = await conn.fetchrow("""
            SELECT 
                config_id, yard_name, area_id,
                top_left_lat, top_left_lng,
                bottom_right_lat, bottom_right_lng,
                canvas_width, canvas_height,
                description, is_active, created_at, updated_at
            FROM cms_yard_config
            WHERE is_active = TRUE
            ORDER BY updated_at DESC
            LIMIT 1
        """)
        
        if not yard_row:
            return None
        
        # Get polygon points (ordered by point_order)
        point_rows = await conn.fetch("""
            SELECT point_id, point_order, latitude, longitude, point_label
            FROM cms_yard_polygon_point
            WHERE config_id = $1
            ORDER BY point_order
        """, yard_row["config_id"])
        
        # Build polygon_points array
        polygon_points = [
            {
                "point_id": row["point_id"],
                "point_order": row["point_order"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "point_label": row["point_label"]
            }
            for row in point_rows
        ]
        
        return {
            "config_id": yard_row["config_id"],
            "yard_name": yard_row["yard_name"],
            "area_id": yard_row["area_id"],
            "top_left": {
                "latitude": float(yard_row["top_left_lat"]),
                "longitude": float(yard_row["top_left_lng"])
            },
            "bottom_right": {
                "latitude": float(yard_row["bottom_right_lat"]),
                "longitude": float(yard_row["bottom_right_lng"])
            },
            "polygon_points": polygon_points,
            "canvas_width": yard_row["canvas_width"],
            "canvas_height": yard_row["canvas_height"],
            "description": yard_row["description"],
            "is_active": yard_row["is_active"],
            "created_at": yard_row["created_at"].isoformat() if yard_row["created_at"] else None,
            "updated_at": yard_row["updated_at"].isoformat() if yard_row["updated_at"] else None
        }


async def get_yard_by_id(pool: asyncpg.Pool, config_id: str) -> Optional[dict]:
    """Get yard configuration by ID with all polygon points."""
    async with pool.acquire() as conn:
        # Get yard config
        yard_row = await conn.fetchrow("""
            SELECT 
                config_id, yard_name, area_id,
                top_left_lat, top_left_lng,
                bottom_right_lat, bottom_right_lng,
                canvas_width, canvas_height,
                description, is_active, created_at, updated_at
            FROM cms_yard_config
            WHERE config_id = $1
        """, config_id)
        
        if not yard_row:
            return None
        
        # Get polygon points
        point_rows = await conn.fetch("""
            SELECT point_id, point_order, latitude, longitude, point_label
            FROM cms_yard_polygon_point
            WHERE config_id = $1
            ORDER BY point_order
        """, config_id)
        
        polygon_points = [
            {
                "point_id": row["point_id"],
                "point_order": row["point_order"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "point_label": row["point_label"]
            }
            for row in point_rows
        ]
        
        return {
            "config_id": yard_row["config_id"],
            "yard_name": yard_row["yard_name"],
            "area_id": yard_row["area_id"],
            "top_left": {
                "latitude": float(yard_row["top_left_lat"]),
                "longitude": float(yard_row["top_left_lng"])
            },
            "bottom_right": {
                "latitude": float(yard_row["bottom_right_lat"]),
                "longitude": float(yard_row["bottom_right_lng"])
            },
            "polygon_points": polygon_points,
            "canvas_width": yard_row["canvas_width"],
            "canvas_height": yard_row["canvas_height"],
            "description": yard_row["description"],
            "is_active": yard_row["is_active"],
            "created_at": yard_row["created_at"].isoformat() if yard_row["created_at"] else None,
            "updated_at": yard_row["updated_at"].isoformat() if yard_row["updated_at"] else None
        }


async def get_all_yards(pool: asyncpg.Pool) -> List[dict]:
    """Get all yard configurations with their polygon points."""
    async with pool.acquire() as conn:
        yard_rows = await conn.fetch("""
            SELECT 
                config_id, yard_name, area_id,
                top_left_lat, top_left_lng,
                bottom_right_lat, bottom_right_lng,
                canvas_width, canvas_height,
                description, is_active, created_at, updated_at
            FROM cms_yard_config
            ORDER BY is_active DESC, updated_at DESC
        """)
        
        yards = []
        for yard_row in yard_rows:
            # Get polygon points for each yard
            point_rows = await conn.fetch("""
                SELECT point_id, point_order, latitude, longitude, point_label
                FROM cms_yard_polygon_point
                WHERE config_id = $1
                ORDER BY point_order
            """, yard_row["config_id"])
            
            polygon_points = [
                {
                    "point_id": row["point_id"],
                    "point_order": row["point_order"],
                    "latitude": float(row["latitude"]),
                    "longitude": float(row["longitude"]),
                    "point_label": row["point_label"]
                }
                for row in point_rows
            ]
            
            yards.append({
                "config_id": yard_row["config_id"],
                "yard_name": yard_row["yard_name"],
                "area_id": yard_row["area_id"],
                "top_left": {
                    "latitude": float(yard_row["top_left_lat"]),
                    "longitude": float(yard_row["top_left_lng"])
                },
                "bottom_right": {
                    "latitude": float(yard_row["bottom_right_lat"]),
                    "longitude": float(yard_row["bottom_right_lng"])
                },
                "polygon_points": polygon_points,
                "canvas_width": yard_row["canvas_width"],
                "canvas_height": yard_row["canvas_height"],
                "description": yard_row["description"],
                "is_active": yard_row["is_active"],
                "created_at": yard_row["created_at"].isoformat() if yard_row["created_at"] else None,
                "updated_at": yard_row["updated_at"].isoformat() if yard_row["updated_at"] else None
            })
        
        return yards


async def update_yard_config(
    pool: asyncpg.Pool,
    config_id: str,
    yard_name: Optional[str] = None,
    area_id: Optional[str] = None,
    top_left_lat: Optional[float] = None,
    top_left_lng: Optional[float] = None,
    bottom_right_lat: Optional[float] = None,
    bottom_right_lng: Optional[float] = None,
    canvas_width: Optional[int] = None,
    canvas_height: Optional[int] = None,
    description: Optional[str] = None,
    is_active: Optional[bool] = None
) -> Optional[dict]:
    """
    Update yard configuration (main table only).
    For polygon points, use add_polygon_point/update_polygon_point/delete_polygon_point.
    """
    async with pool.acquire() as conn:
        # Build update query dynamically
        updates = []
        params = [config_id]
        param_idx = 2
        
        if yard_name is not None:
            updates.append(f"yard_name = ${param_idx}")
            params.append(yard_name)
            param_idx += 1
        
        if area_id is not None:
            updates.append(f"area_id = ${param_idx}")
            params.append(area_id)
            param_idx += 1
        
        if top_left_lat is not None:
            updates.append(f"top_left_lat = ${param_idx}")
            params.append(top_left_lat)
            param_idx += 1
        
        if top_left_lng is not None:
            updates.append(f"top_left_lng = ${param_idx}")
            params.append(top_left_lng)
            param_idx += 1
        
        if bottom_right_lat is not None:
            updates.append(f"bottom_right_lat = ${param_idx}")
            params.append(bottom_right_lat)
            param_idx += 1
        
        if bottom_right_lng is not None:
            updates.append(f"bottom_right_lng = ${param_idx}")
            params.append(bottom_right_lng)
            param_idx += 1
        
        if canvas_width is not None:
            updates.append(f"canvas_width = ${param_idx}")
            params.append(canvas_width)
            param_idx += 1
        
        if canvas_height is not None:
            updates.append(f"canvas_height = ${param_idx}")
            params.append(canvas_height)
            param_idx += 1
        
        if description is not None:
            updates.append(f"description = ${param_idx}")
            params.append(description)
            param_idx += 1
        
        if is_active is not None:
            # If setting to active, deactivate all others first
            if is_active:
                await conn.execute("UPDATE cms_yard_config SET is_active = FALSE")
            updates.append(f"is_active = ${param_idx}")
            params.append(is_active)
            param_idx += 1
        
        updates.append("updated_at = NOW()")
        
        if not updates or len(updates) == 1:  # Only updated_at
            return await get_yard_by_id(pool, config_id)
        
        query = f"""
            UPDATE cms_yard_config
            SET {', '.join(updates)}
            WHERE config_id = $1
            RETURNING config_id
        """
        
        await conn.fetchval(query, *params)
        return await get_yard_by_id(pool, config_id)


# ═══════════════════════════════════════════════════════════
# POLYGON POINT MANAGEMENT (New Functions)
# ═══════════════════════════════════════════════════════════

async def add_polygon_point(
    pool: asyncpg.Pool,
    config_id: str,
    point_order: int,
    latitude: float,
    longitude: float,
    point_label: Optional[str] = None
) -> dict:
    """Add a new polygon point."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO cms_yard_polygon_point 
                (config_id, point_order, latitude, longitude, point_label)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING point_id, config_id, point_order, latitude, longitude, point_label, created_at
        """, config_id, point_order, latitude, longitude, point_label)
        
        return {
            "point_id": row["point_id"],
            "config_id": row["config_id"],
            "point_order": row["point_order"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "point_label": row["point_label"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }


async def update_polygon_point(
    pool: asyncpg.Pool,
    point_id: int,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    point_order: Optional[int] = None,
    point_label: Optional[str] = None
) -> Optional[dict]:
    """Update a polygon point."""
    async with pool.acquire() as conn:
        updates = []
        params = [point_id]
        param_idx = 2
        
        if latitude is not None:
            updates.append(f"latitude = ${param_idx}")
            params.append(latitude)
            param_idx += 1
        
        if longitude is not None:
            updates.append(f"longitude = ${param_idx}")
            params.append(longitude)
            param_idx += 1
        
        if point_order is not None:
            updates.append(f"point_order = ${param_idx}")
            params.append(point_order)
            param_idx += 1
        
        if point_label is not None:
            updates.append(f"point_label = ${param_idx}")
            params.append(point_label)
            param_idx += 1
        
        if not updates:
            # No changes, return current
            row = await conn.fetchrow("""
                SELECT point_id, config_id, point_order, latitude, longitude, point_label, created_at
                FROM cms_yard_polygon_point
                WHERE point_id = $1
            """, point_id)
        else:
            query = f"""
                UPDATE cms_yard_polygon_point
                SET {', '.join(updates)}
                WHERE point_id = $1
                RETURNING point_id, config_id, point_order, latitude, longitude, point_label, created_at
            """
            row = await conn.fetchrow(query, *params)
        
        if not row:
            return None
        
        return {
            "point_id": row["point_id"],
            "config_id": row["config_id"],
            "point_order": row["point_order"],
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "point_label": row["point_label"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None
        }


async def delete_polygon_point(pool: asyncpg.Pool, point_id: int) -> bool:
    """Delete a polygon point. Returns True if deleted, False if not found."""
    async with pool.acquire() as conn:
        result = await conn.execute("""
            DELETE FROM cms_yard_polygon_point
            WHERE point_id = $1
        """, point_id)
        return result == "DELETE 1"


async def replace_all_polygon_points(
    pool: asyncpg.Pool,
    config_id: str,
    points: List[dict]
) -> List[dict]:
    """
    Replace all polygon points for a yard.
    points = [{"point_order": 1, "latitude": -6.1, "longitude": 106.8, "point_label": "Corner A"}, ...]
    """
    async with pool.acquire() as conn:
        async with conn.transaction():
            # Delete all existing points
            await conn.execute("""
                DELETE FROM cms_yard_polygon_point
                WHERE config_id = $1
            """, config_id)
            
            # Insert new points
            new_points = []
            for point in points:
                row = await conn.fetchrow("""
                    INSERT INTO cms_yard_polygon_point 
                        (config_id, point_order, latitude, longitude, point_label)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING point_id, config_id, point_order, latitude, longitude, point_label, created_at
                """, 
                    config_id, 
                    point["point_order"], 
                    point["latitude"], 
                    point["longitude"],
                    point.get("point_label")
                )
                
                new_points.append({
                    "point_id": row["point_id"],
                    "config_id": row["config_id"],
                    "point_order": row["point_order"],
                    "latitude": float(row["latitude"]),
                    "longitude": float(row["longitude"]),
                    "point_label": row["point_label"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else None
                })
            
            return new_points
