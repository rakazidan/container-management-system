-- ============================================================
-- Migration 001: Create Tables
-- Container Management System
-- ============================================================

-- Area: grup dari beberapa zone
CREATE TABLE IF NOT EXISTS tb_m_area (
    area_id     VARCHAR(20) PRIMARY KEY,
    area_name   VARCHAR(100) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Shipping Agent master
CREATE TABLE IF NOT EXISTS tb_m_shipping_agent (
    agent_id    VARCHAR(20) PRIMARY KEY,
    agent_name  VARCHAR(100) NOT NULL,
    code        VARCHAR(10),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Zone: 1 zone = 1 stack position, didefinisikan dengan 4 titik GPS
CREATE TABLE IF NOT EXISTS tb_m_zone (
    zone_id             VARCHAR(50) PRIMARY KEY,
    zone_name           VARCHAR(50) NOT NULL,
    area_id             VARCHAR(20) REFERENCES tb_m_area(area_id),
    -- 4 corner GPS points sebagai JSONB: {"latitude": float, "longitude": float}
    latlong_upleft      JSONB NOT NULL,
    latlong_downleft    JSONB NOT NULL,
    latlong_upright     JSONB NOT NULL,
    latlong_downright   JSONB NOT NULL,
    -- Center point (rata-rata 4 corners)
    center_latitude     DECIMAL(10, 8),
    center_longitude    DECIMAL(11, 8),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Container (current position)
CREATE TABLE IF NOT EXISTS tb_m_container (
    container_id     VARCHAR(50) PRIMARY KEY,
    container_number VARCHAR(20) NOT NULL UNIQUE,
    agent_id         VARCHAR(20) REFERENCES tb_m_shipping_agent(agent_id),
    zone_id          VARCHAR(50) REFERENCES tb_m_zone(zone_id),
    stack_level      SMALLINT CHECK (stack_level BETWEEN 1 AND 4),
    yard_in_date     TIMESTAMP NOT NULL,
    yard_out_date    TIMESTAMP,
    status           VARCHAR(20) DEFAULT 'IN_YARD'
                         CHECK (status IN ('IN_YARD', 'MOVED', 'OUT')),
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- History pergerakan container
CREATE TABLE IF NOT EXISTS tb_l_history_container (
    history_id       SERIAL PRIMARY KEY,
    container_number VARCHAR(20) NOT NULL,
    from_zone_id     VARCHAR(50),
    to_zone_id       VARCHAR(50),
    from_stack_level SMALLINT,
    to_stack_level   SMALLINT,
    operator         VARCHAR(100),
    moved_at         TIMESTAMP DEFAULT NOW(),
    notes            TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_container_zone     ON tb_m_container(zone_id);
CREATE INDEX IF NOT EXISTS idx_container_number   ON tb_m_container(container_number);
CREATE INDEX IF NOT EXISTS idx_container_agent    ON tb_m_container(agent_id);
CREATE INDEX IF NOT EXISTS idx_container_status   ON tb_m_container(status);
CREATE INDEX IF NOT EXISTS idx_history_number     ON tb_l_history_container(container_number);
CREATE INDEX IF NOT EXISTS idx_history_moved_at   ON tb_l_history_container(moved_at DESC);
