import asyncpg
from typing import Optional


async def create_table(pool: asyncpg.Pool) -> None:
    """Buat tabel cms_gps_log jika belum ada."""
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS cms_gps_log (
                id          SERIAL PRIMARY KEY,
                device_id   VARCHAR(50) NOT NULL DEFAULT 'esp32-01',
                lat         DECIMAL(10, 8) NOT NULL,
                lng         DECIMAL(11, 8) NOT NULL,
                recorded_at TIMESTAMP DEFAULT NOW()
            )
        """)
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_gps_device_time ON cms_gps_log(device_id, recorded_at DESC)"
        )


async def insert_gps(pool: asyncpg.Pool, lat: float, lng: float, device_id: str) -> dict:
    """Insert satu GPS record dan return data yang disimpan."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO cms_gps_log (device_id, lat, lng)
            VALUES ($1, $2, $3)
            RETURNING id, device_id, lat, lng, recorded_at
            """,
            device_id, lat, lng,
        )
    return _fmt(row)


async def get_latest(pool: asyncpg.Pool, device_id: str) -> Optional[dict]:
    """Ambil GPS record terbaru untuk device tertentu."""
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, device_id, lat, lng, recorded_at
            FROM cms_gps_log
            WHERE device_id = $1
            ORDER BY recorded_at DESC
            LIMIT 1
            """,
            device_id,
        )
    return _fmt(row) if row else None


async def get_history(pool: asyncpg.Pool, device_id: str, limit: int) -> list[dict]:
    """Ambil history GPS readings, terbaru di atas."""
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, device_id, lat, lng, recorded_at
            FROM cms_gps_log
            WHERE device_id = $1
            ORDER BY recorded_at DESC
            LIMIT $2
            """,
            device_id, limit,
        )
    return [_fmt(r) for r in rows]


def _fmt(row) -> dict:
    return {
        "id": row["id"],
        "device_id": row["device_id"],
        "lat": float(row["lat"]),
        "lng": float(row["lng"]),
        "recorded_at": row["recorded_at"].strftime("%Y-%m-%d %H:%M:%S"),
    }
