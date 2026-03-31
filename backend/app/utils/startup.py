"""
startup.py — Dijalankan saat backend pertama kali start.
Membuat tabel dan seed data awal jika DB masih kosong.
"""
import asyncpg
import json
from datetime import datetime


# ─── DDL ──────────────────────────────────────────────────────────────────────

_CREATE_TABLES = [
    """CREATE TABLE IF NOT EXISTS cms_area (
        area_id    VARCHAR(20) PRIMARY KEY,
        area_name  VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    )""",
    """CREATE TABLE IF NOT EXISTS cms_shipping_agent (
        agent_id   VARCHAR(20) PRIMARY KEY,
        agent_name VARCHAR(100) NOT NULL,
        code       VARCHAR(10)
    )""",
    """CREATE TABLE IF NOT EXISTS cms_zone (
        zone_id           VARCHAR(50) PRIMARY KEY,
        zone_name         VARCHAR(50) NOT NULL,
        area_id           VARCHAR(20),
        latlong_upleft    JSONB NOT NULL,
        latlong_downleft  JSONB NOT NULL,
        latlong_upright   JSONB NOT NULL,
        latlong_downright JSONB NOT NULL,
        center_latitude   DECIMAL(10,8),
        center_longitude  DECIMAL(11,8),
        is_active         BOOLEAN DEFAULT TRUE,
        created_at        TIMESTAMP DEFAULT NOW()
    )""",
    """CREATE TABLE IF NOT EXISTS cms_container (
        container_id     VARCHAR(50) PRIMARY KEY,
        container_number VARCHAR(20) NOT NULL UNIQUE,
        agent_id         VARCHAR(20),
        zone_id          VARCHAR(50),
        stack_level      SMALLINT,
        yard_in_date     TIMESTAMP NOT NULL,
        yard_out_date    TIMESTAMP,
        status           VARCHAR(20) DEFAULT 'IN_YARD',
        created_at       TIMESTAMP DEFAULT NOW()
    )""",
    """CREATE TABLE IF NOT EXISTS cms_history (
        history_id       SERIAL PRIMARY KEY,
        container_number VARCHAR(20) NOT NULL,
        from_zone_id     VARCHAR(50),
        to_zone_id       VARCHAR(50),
        from_stack_level SMALLINT,
        to_stack_level   SMALLINT,
        operator         VARCHAR(100),
        moved_at         TIMESTAMP DEFAULT NOW(),
        notes            TEXT
    )""",
    """CREATE TABLE IF NOT EXISTS cms_gps_log (
        id          SERIAL PRIMARY KEY,
        device_id   VARCHAR(50) NOT NULL DEFAULT 'esp32-01',
        lat         DECIMAL(10,8) NOT NULL,
        lng         DECIMAL(11,8) NOT NULL,
        recorded_at TIMESTAMP DEFAULT NOW()
    )""",
    "CREATE INDEX IF NOT EXISTS idx_cms_container_zone   ON cms_container(zone_id)",
    "CREATE INDEX IF NOT EXISTS idx_cms_container_number ON cms_container(container_number)",
    "CREATE INDEX IF NOT EXISTS idx_cms_container_status ON cms_container(status)",
    "CREATE INDEX IF NOT EXISTS idx_cms_history_moved_at ON cms_history(moved_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_gps_device_time      ON cms_gps_log(device_id, recorded_at DESC)",
]

# ─── Seed Data ─────────────────────────────────────────────────────────────────

_AGENTS = [
    ("AG001", "Maersk Line",  "MSCU"),
    ("AG002", "MSC",          "MSCU"),
    ("AG003", "CMA CGM",      "CMAU"),
    ("AG004", "COSCO",        "COSU"),
    ("AG005", "Hapag-Lloyd",  "HLXU"),
    ("AG006", "ONE",          "ONEY"),
    ("AG007", "Evergreen",    "EISU"),
    ("AG008", "Yang Ming",    "YLMU"),
]

_ZONE_NAMES = list("ABCDEFGHIJKLMNOPQRST")

_CONTAINERS = [
    ("c-zone-A-L1","MSCU1234567","AG001","zone-A",1,"2025-11-15 08:30:45"),
    ("c-zone-A-L2","TCLU9876543","AG002","zone-A",2,"2025-11-20 14:22:10"),
    ("c-zone-A-L3","CSNU5551234","AG003","zone-A",3,"2025-11-28 09:15:30"),
    ("c-zone-B-L1","HLXU7773331","AG005","zone-B",1,"2025-12-01 06:00:00"),
    ("c-zone-C-L1","MSCU2345678","AG001","zone-C",1,"2025-11-10 07:00:00"),
    ("c-zone-C-L2","COSU4444444","AG004","zone-C",2,"2025-11-12 11:00:00"),
    ("c-zone-C-L3","YLMU8888888","AG008","zone-C",3,"2025-11-18 15:00:00"),
    ("c-zone-C-L4","TCLU1111222","AG002","zone-C",4,"2025-11-25 10:00:00"),
    ("c-zone-D-L1","EISU6669991","AG007","zone-D",1,"2025-11-22 08:00:00"),
    ("c-zone-D-L2","MSCU3456789","AG001","zone-D",2,"2025-11-30 13:00:00"),
    ("c-zone-F-L1","CMAU9992221","AG003","zone-F",1,"2025-11-16 09:00:00"),
    ("c-zone-F-L2","HLXU5553331","AG005","zone-F",2,"2025-11-19 16:00:00"),
    ("c-zone-F-L3","ONEY7777771","AG006","zone-F",3,"2025-11-27 11:00:00"),
    ("c-zone-G-L1","MSCU4567890","AG001","zone-G",1,"2025-12-05 07:30:00"),
    ("c-zone-H-L1","TCLU3332211","AG002","zone-H",1,"2025-11-14 10:00:00"),
    ("c-zone-H-L2","COSU1115551","AG004","zone-H",2,"2025-11-21 14:00:00"),
    ("c-zone-I-L1","EISU2228881","AG007","zone-I",1,"2025-11-08 06:00:00"),
    ("c-zone-I-L2","MSCU5678901","AG001","zone-I",2,"2025-11-11 09:00:00"),
    ("c-zone-I-L3","HLXU4446661","AG005","zone-I",3,"2025-11-17 12:00:00"),
    ("c-zone-I-L4","YLMU9993331","AG008","zone-I",4,"2025-11-24 15:00:00"),
    ("c-zone-K-L1","CMAU7771111","AG003","zone-K",1,"2025-11-13 08:00:00"),
    ("c-zone-K-L2","TCLU4443211","AG002","zone-K",2,"2025-11-26 11:00:00"),
    ("c-zone-L-L1","MSCU6789012","AG001","zone-L",1,"2025-12-03 07:00:00"),
    ("c-zone-M-L1","COSU2226661","AG004","zone-M",1,"2025-11-09 09:00:00"),
    ("c-zone-M-L2","EISU3331111","AG007","zone-M",2,"2025-11-15 13:00:00"),
    ("c-zone-M-L3","ONEY5554441","AG006","zone-M",3,"2025-11-23 16:00:00"),
    ("c-zone-O-L1","HLXU2221111","AG005","zone-O",1,"2025-11-20 10:00:00"),
    ("c-zone-O-L2","MSCU7890123","AG001","zone-O",2,"2025-11-29 14:00:00"),
    ("c-zone-P-L1","TCLU5556781","AG002","zone-P",1,"2025-12-04 08:00:00"),
    ("c-zone-Q-L1","CMAU1113331","AG003","zone-Q",1,"2025-11-07 07:00:00"),
    ("c-zone-Q-L2","COSU3338881","AG004","zone-Q",2,"2025-11-10 10:00:00"),
    ("c-zone-Q-L3","YLMU1114441","AG008","zone-Q",3,"2025-11-16 13:00:00"),
    ("c-zone-Q-L4","EISU8881111","AG007","zone-Q",4,"2025-11-22 16:00:00"),
    ("c-zone-R-L1","MSCU8901234","AG001","zone-R",1,"2025-11-18 09:00:00"),
    ("c-zone-R-L2","ONEY2226661","AG006","zone-R",2,"2025-11-27 12:00:00"),
]

_HISTORY = [
    ("TCLU1234567","zone-A","zone-B",3,1,"Controller 1","2025-11-30 14:30:00"),
    ("MSCU9876543","zone-C","zone-A",4,2,"Controller 2","2025-11-30 13:45:00"),
    ("CMAU5551234","zone-B","zone-D",2,3,"Controller 1","2025-11-30 12:20:00"),
    ("HLXU7778888","zone-D","zone-E",1,4,"Controller 3","2025-11-30 11:15:00"),
    ("ONEY4445566","zone-E","zone-C",3,1,"Controller 2","2025-11-30 10:30:00"),
    ("TCLU2223344","zone-A","zone-B",2,4,"Controller 1","2025-11-30 09:45:00"),
    ("MSCU6667788","zone-B","zone-A",4,2,"Controller 4","2025-11-30 09:00:00"),
    ("CMAU9990011","zone-C","zone-D",1,3,"Controller 2","2025-11-29 16:30:00"),
    ("HLXU3334455","zone-D","zone-E",3,1,"Controller 1","2025-11-29 15:45:00"),
    ("ONEY1112233","zone-E","zone-A",2,4,"Controller 3","2025-11-29 14:20:00"),
    ("TCLU5556677","zone-A","zone-B",1,2,"Controller 2","2025-11-29 13:15:00"),
    ("MSCU8889900","zone-B","zone-C",3,1,"Controller 1","2025-11-29 12:30:00"),
    ("CMAU2221133","zone-C","zone-D",4,2,"Controller 4","2025-11-29 11:45:00"),
    ("HLXU6665544","zone-D","zone-E",1,3,"Controller 2","2025-11-29 10:00:00"),
    ("ONEY9998877","zone-E","zone-A",4,1,"Controller 1","2025-11-29 09:15:00"),
    ("TCKU3332211","zone-A","zone-B",4,3,"Controller 3","2025-11-28 16:30:00"),
    ("MSCU7776655","zone-B","zone-C",1,2,"Controller 2","2025-11-28 15:45:00"),
    ("CMAU4443322","zone-C","zone-D",3,4,"Controller 1","2025-11-28 14:20:00"),
    ("HLXU1119988","zone-D","zone-E",2,1,"Controller 4","2025-11-28 13:15:00"),
    ("ONEY5554433","zone-E","zone-A",4,2,"Controller 2","2025-11-28 12:30:00"),
]


def _make_zones() -> list[dict]:
    zones = []
    for i, name in enumerate(_ZONE_NAMES):
        row, col   = i // 5, i % 5
        lat_top    = -6.2000 + row * 0.0025
        lat_bot    = lat_top + 0.0025
        lon_left   = 106.8000 + col * 0.0020
        lon_right  = lon_left + 0.0020
        zones.append({
            "zone_id":   f"zone-{name}",
            "zone_name": name,
            "area_id":   "area-01",
            "upleft":    {"latitude": lat_top,  "longitude": lon_left},
            "downleft":  {"latitude": lat_bot,  "longitude": lon_left},
            "upright":   {"latitude": lat_top,  "longitude": lon_right},
            "downright": {"latitude": lat_bot,  "longitude": lon_right},
            "clat":      (lat_top + lat_bot) / 2,
            "clon":      (lon_left + lon_right) / 2,
        })
    return zones


# ─── Main entry ────────────────────────────────────────────────────────────────

async def run_startup(pool: asyncpg.Pool) -> None:
    """Buat semua tabel dan seed data jika masih kosong."""
    async with pool.acquire() as conn:
        # Register JSONB codec
        await conn.set_type_codec(
            "jsonb",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )

        # 1. Create tables
        for sql in _CREATE_TABLES:
            await conn.execute(sql)
        print("✅ Tables ready")

        # 2. Seed hanya jika zone masih kosong
        zone_count = await conn.fetchval("SELECT COUNT(*) FROM cms_zone")
        if zone_count > 0:
            print(f"✅ Seed skipped — {zone_count} zones already exist")
            return

        print("🌱 Seeding initial data...")

        # Area
        await conn.execute(
            "INSERT INTO cms_area(area_id, area_name) VALUES($1,$2) ON CONFLICT DO NOTHING",
            "area-01", "Main Yard",
        )

        # Agents
        for a in _AGENTS:
            await conn.execute(
                "INSERT INTO cms_shipping_agent(agent_id, agent_name, code) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
                *a,
            )

        # Zones
        for z in _make_zones():
            await conn.execute(
                """INSERT INTO cms_zone
                   (zone_id, zone_name, area_id,
                    latlong_upleft, latlong_downleft, latlong_upright, latlong_downright,
                    center_latitude, center_longitude)
                   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING""",
                z["zone_id"], z["zone_name"], z["area_id"],
                z["upleft"], z["downleft"], z["upright"], z["downright"],
                z["clat"], z["clon"],
            )

        # Containers
        for c in _CONTAINERS:
            await conn.execute(
                """INSERT INTO cms_container
                   (container_id, container_number, agent_id, zone_id, stack_level, yard_in_date)
                   VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING""",
                c[0], c[1], c[2], c[3], c[4],
                datetime.strptime(c[5], "%Y-%m-%d %H:%M:%S"),
            )

        # History
        for h in _HISTORY:
            await conn.execute(
                """INSERT INTO cms_history
                   (container_number, from_zone_id, to_zone_id,
                    from_stack_level, to_stack_level, operator, moved_at)
                   VALUES($1,$2,$3,$4,$5,$6,$7)""",
                h[0], h[1], h[2], h[3], h[4], h[5],
                datetime.strptime(h[6], "%Y-%m-%d %H:%M:%S"),
            )

        total_c = await conn.fetchval("SELECT COUNT(*) FROM cms_container")
        total_z = await conn.fetchval("SELECT COUNT(*) FROM cms_zone")
        print(f"✅ Seed done — {total_z} zones, {total_c} containers")
