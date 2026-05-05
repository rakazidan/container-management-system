-- ============================================================
-- Migration 003: Yard Configuration Tables (SIMPLIFIED)
-- Menyimpan boundary (batas area) yard untuk GPS tracking
-- ============================================================

-- ┌─────────────────────────────────────────────────────────────┐
-- │ PENJELASAN STRUKTUR:                                        │
-- │ Tabel dipisah menjadi 2 untuk kemudahan management:        │
-- │  1. cms_yard_config        → Data utama yard               │
-- │  2. cms_yard_polygon_point → Titik-titik polygon (detail)  │
-- │                                                             │
-- │ Keuntungan struktur ini:                                    │
-- │  ✓ Insert titik baru lebih mudah (1 row = 1 titik)        │
-- │  ✓ Update koordinat lebih mudah (tidak perlu parse JSONB)  │
-- │  ✓ Query lebih SQL-native (JOIN, ORDER BY, dll)           │
-- │  ✓ Tidak perlu kompleksitas JSONB parsing                  │
-- └─────────────────────────────────────────────────────────────┘


-- ═══════════════════════════════════════════════════════════════
-- TABEL 1: cms_yard_config (Data Utama Yard)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cms_yard_config (
    -- ══════════════════════════════════════
    -- IDENTITAS YARD
    -- ══════════════════════════════════════
    config_id       VARCHAR(50) PRIMARY KEY,    -- ID unik yard (contoh: 'yard-main')
    yard_name       VARCHAR(100) NOT NULL,       -- Nama yard (contoh: 'Main Container Yard')
    area_id         VARCHAR(20) REFERENCES cms_area(area_id), -- Link ke area
    
    -- ══════════════════════════════════════
    -- BOUNDING BOX (Kotak Pembatas)
    -- Koordinat GPS rectangle sederhana
    -- ══════════════════════════════════════
    --        top_left (lat, lng)
    --              ●─────────────┐
    --              │             │
    --              │   YARD      │
    --              │             │
    --              └─────────────● bottom_right (lat, lng)
    
    top_left_lat    DECIMAL(10, 8) NOT NULL,    -- Latitude sudut KIRI ATAS (contoh: -6.227514)
    top_left_lng    DECIMAL(11, 8) NOT NULL,    -- Longitude sudut KIRI ATAS (contoh: 106.818225)
    bottom_right_lat DECIMAL(10, 8) NOT NULL,   -- Latitude sudut KANAN BAWAH (contoh: -6.225714)
    bottom_right_lng DECIMAL(11, 8) NOT NULL,   -- Longitude sudut KANAN BAWAH (contoh: 106.820025)
    
    -- ══════════════════════════════════════
    -- CANVAS DISPLAY SETTINGS
    -- ══════════════════════════════════════
    canvas_width    INTEGER DEFAULT 1200,        -- Lebar canvas (px)
    canvas_height   INTEGER DEFAULT 800,         -- Tinggi canvas (px)
    
    -- ══════════════════════════════════════
    -- METADATA
    -- ══════════════════════════════════════
    description     TEXT,                        -- Deskripsi yard
    is_active       BOOLEAN DEFAULT TRUE,        -- Yard yang aktif dipakai (hanya 1 yard active)
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);


-- ═══════════════════════════════════════════════════════════════
-- TABEL 2: cms_yard_polygon_point (Titik-Titik Polygon Detail)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cms_yard_polygon_point (
    point_id        SERIAL PRIMARY KEY,          -- ID auto-increment
    config_id       VARCHAR(50) NOT NULL         -- Link ke yard
                    REFERENCES cms_yard_config(config_id) 
                    ON DELETE CASCADE,           -- Hapus titik jika yard dihapus
    
    -- ══════════════════════════════════════
    -- KOORDINAT GPS
    -- ══════════════════════════════════════
    point_order     INTEGER NOT NULL,            -- Urutan titik (1, 2, 3, 4, ...)
    latitude        DECIMAL(10, 8) NOT NULL,     -- Latitude titik (contoh: -6.227514)
    longitude       DECIMAL(11, 8) NOT NULL,     -- Longitude titik (contoh: 106.818225)
    
    -- ══════════════════════════════════════
    -- LABEL/KETERANGAN (Optional)
    -- ══════════════════════════════════════
    point_label     VARCHAR(50),                 -- Label titik (contoh: 'Kiri Atas', 'Corner A', dll)
    
    created_at      TIMESTAMP DEFAULT NOW(),
    
    -- Constraint: kombinasi config_id + point_order harus unik
    UNIQUE(config_id, point_order)
);

-- ═══════════════════════════════════════════════════════════
-- INDEX & CONSTRAINTS
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_yard_config_active 
    ON cms_yard_config(is_active);

CREATE INDEX IF NOT EXISTS idx_polygon_point_config 
    ON cms_yard_polygon_point(config_id);

CREATE INDEX IF NOT EXISTS idx_polygon_point_order 
    ON cms_yard_polygon_point(config_id, point_order);


-- ═══════════════════════════════════════════════════════════
-- DATABASE COMMENTS (Dokumentasi)
-- ═══════════════════════════════════════════════════════════
COMMENT ON TABLE cms_yard_config IS 
'Konfigurasi utama yard untuk GPS tracking. Menyimpan boundary box dan settings canvas.';

COMMENT ON TABLE cms_yard_polygon_point IS 
'Detail titik-titik GPS yang membentuk polygon boundary yard. Setiap row = 1 titik koordinat.';

COMMENT ON COLUMN cms_yard_config.config_id IS 
'ID unik yard configuration (contoh: yard-main, yard-north)';

COMMENT ON COLUMN cms_yard_config.top_left_lat IS 
'Latitude sudut KIRI ATAS bounding box (nilai latitude lebih BESAR karena lebih ke utara)';

COMMENT ON COLUMN cms_yard_config.bottom_right_lat IS 
'Latitude sudut KANAN BAWAH bounding box (nilai latitude lebih KECIL karena lebih ke selatan)';

COMMENT ON COLUMN cms_yard_config.is_active IS 
'Flag yard yang sedang aktif digunakan. Hanya 1 yard yang boleh active pada satu waktu.';

COMMENT ON COLUMN cms_yard_polygon_point.point_order IS 
'Urutan titik dalam polygon (1, 2, 3, ...). Titik akan di-connect sesuai urutan ini untuk membentuk boundary.';

COMMENT ON COLUMN cms_yard_polygon_point.point_label IS 
'Label deskriptif untuk titik (contoh: "Kiri Atas", "Corner A", "Gate Entrance"). Optional untuk memudahkan identifikasi.';


-- ═══════════════════════════════════════════════════════════
-- INSERT DEFAULT DATA
-- Data yard default sesuai lokasi GPS user saat ini
-- ═══════════════════════════════════════════════════════════

-- Step 1: Insert yard configuration utama
INSERT INTO cms_yard_config (
    config_id, 
    yard_name, 
    area_id,
    top_left_lat,          -- Sudut Kiri Atas (North-West)
    top_left_lng,
    bottom_right_lat,      -- Sudut Kanan Bawah (South-East)
    bottom_right_lng,
    canvas_width,
    canvas_height,
    description,
    is_active
) VALUES (
    'yard-main',
    'Main Container Yard',
    'area-01',
    -6.227514,             -- Top Left Latitude (lebih ke utara)
    106.818225,            -- Top Left Longitude (lebih ke barat)
    -6.225714,             -- Bottom Right Latitude (lebih ke selatan)
    106.820025,            -- Bottom Right Longitude (lebih ke timur)
    1200,                  -- Canvas width (px)
    800,                   -- Canvas height (px)
    'Main yard centered at -6.226614, 106.819125 with ~100m radius coverage',
    TRUE                   -- Active yard
);

-- Step 2: Insert polygon points (4 titik rectangle)
-- Urutan titik: Kiri Atas → Kanan Atas → Kanan Bawah → Kiri Bawah
INSERT INTO cms_yard_polygon_point 
    (config_id, point_order, latitude, longitude, point_label) 
VALUES
    ('yard-main', 1, -6.227514, 106.818225, 'Kiri Atas (North-West)'),
    ('yard-main', 2, -6.227514, 106.820025, 'Kanan Atas (North-East)'),
    ('yard-main', 3, -6.225714, 106.820025, 'Kanan Bawah (South-East)'),
    ('yard-main', 4, -6.225714, 106.818225, 'Kiri Bawah (South-West)');


-- ═══════════════════════════════════════════════════════════
-- CONTOH QUERY BERGUNA (MUDAH DIMENGERTI!)
-- ═══════════════════════════════════════════════════════════

-- ┌────────────────────────────────────────────────────────────┐
-- │ 1. GET ACTIVE YARD + SEMUA POLYGON POINTS                  │
-- └────────────────────────────────────────────────────────────┘
-- Query ini JOIN 2 tabel untuk dapat config + semua titik polygon
--
-- SELECT 
--     c.config_id,
--     c.yard_name,
--     c.is_active,
--     p.point_order,
--     p.latitude,
--     p.longitude,
--     p.point_label
-- FROM cms_yard_config c
-- LEFT JOIN cms_yard_polygon_point p ON c.config_id = p.config_id
-- WHERE c.is_active = TRUE
-- ORDER BY p.point_order;
--
-- RESULT EXAMPLE:
-- ┌─────────────┬──────────────┬────────┬────────────┬───────────┬────────────┬──────────────────┐
-- │ config_id   │ yard_name    │active  │point_order │ latitude  │ longitude  │ point_label      │
-- ├─────────────┼──────────────┼────────┼────────────┼───────────┼────────────┼──────────────────┤
-- │ yard-main   │ Main Cont... │ TRUE   │     1      │ -6.227514 │ 106.818225 │ Kiri Atas        │
-- │ yard-main   │ Main Cont... │ TRUE   │     2      │ -6.227514 │ 106.820025 │ Kanan Atas       │
-- │ yard-main   │ Main Cont... │ TRUE   │     3      │ -6.225714 │ 106.820025 │ Kanan Bawah      │
-- │ yard-main   │ Main Cont... │ TRUE   │     4      │ -6.225714 │ 106.818225 │ Kiri Bawah       │
-- └─────────────┴──────────────┴────────┴────────────┴───────────┴────────────┴──────────────────┘


-- ┌────────────────────────────────────────────────────────────┐
-- │ 2. ADD TITIK POLYGON BARU (contoh: tambah titik ke-5)     │
-- └────────────────────────────────────────────────────────────┘
-- Sangat mudah! Cukup INSERT 1 row = 1 titik
--
-- INSERT INTO cms_yard_polygon_point 
--     (config_id, point_order, latitude, longitude, point_label) 
-- VALUES 
--     ('yard-main', 5, -6.226500, 106.819000, 'Notch Point');


-- ┌────────────────────────────────────────────────────────────┐
-- │ 3. UPDATE KOORDINAT TITIK TERTENTU                         │
-- └────────────────────────────────────────────────────────────┘
-- Update koordinat titik ke-2 (Kanan Atas)
--
-- UPDATE cms_yard_polygon_point
-- SET latitude = -6.227600,
--     longitude = 106.820100
-- WHERE config_id = 'yard-main' 
--   AND point_order = 2;


-- ┌────────────────────────────────────────────────────────────┐
-- │ 4. HAPUS TITIK POLYGON                                     │
-- └────────────────────────────────────────────────────────────┘
-- Hapus titik ke-5 (jika ada)
--
-- DELETE FROM cms_yard_polygon_point
-- WHERE config_id = 'yard-main' 
--   AND point_order = 5;


-- ┌────────────────────────────────────────────────────────────┐
-- │ 5. COUNT TOTAL TITIK POLYGON                               │
-- └────────────────────────────────────────────────────────────┘
-- SELECT 
--     config_id,
--     COUNT(*) as total_points
-- FROM cms_yard_polygon_point
-- WHERE config_id = 'yard-main'
-- GROUP BY config_id;


-- ┌────────────────────────────────────────────────────────────┐
-- │ 6. SET YARD AS ACTIVE (deactivate others)                 │
-- └────────────────────────────────────────────────────────────┘
-- UPDATE cms_yard_config SET is_active = FALSE;
-- UPDATE cms_yard_config SET is_active = TRUE 
-- WHERE config_id = 'yard-main';


-- ┌────────────────────────────────────────────────────────────┐
-- │ 7. CALCULATE YARD SIZE (dalam meter)                      │
-- └────────────────────────────────────────────────────────────┘
-- SELECT 
--     yard_name,
--     CONCAT(top_left_lat, ', ', top_left_lng) as top_left,
--     CONCAT(bottom_right_lat, ', ', bottom_right_lng) as bottom_right,
--     ROUND((top_left_lat - bottom_right_lat) * 111000) as height_meters,
--     ROUND((bottom_right_lng - top_left_lng) * 111000 * 
--           COS(RADIANS((top_left_lat + bottom_right_lat) / 2))) as width_meters
-- FROM cms_yard_config
-- WHERE is_active = TRUE;


-- ┌────────────────────────────────────────────────────────────┐
-- │ 8. GET POLYGON AS GeoJSON FORMAT (untuk frontend)         │
-- └────────────────────────────────────────────────────────────┘
-- SELECT 
--     c.config_id,
--     c.yard_name,
--     json_build_object(
--         'type', 'Polygon',
--         'coordinates', json_agg(
--             json_build_array(p.longitude, p.latitude)
--             ORDER BY p.point_order
--         )
--     ) as geojson
-- FROM cms_yard_config c
-- JOIN cms_yard_polygon_point p ON c.config_id = p.config_id
-- WHERE c.is_active = TRUE
-- GROUP BY c.config_id, c.yard_name;


-- ┌────────────────────────────────────────────────────────────┐
-- │ 9. REPLACE SEMUA TITIK POLYGON (delete + insert baru)     │
-- └────────────────────────────────────────────────────────────┘
-- -- Step 1: Hapus semua titik lama
-- DELETE FROM cms_yard_polygon_point WHERE config_id = 'yard-main';
--
-- -- Step 2: Insert titik baru (custom shape dengan 5 titik)
-- INSERT INTO cms_yard_polygon_point 
--     (config_id, point_order, latitude, longitude, point_label) 
-- VALUES
--     ('yard-main', 1, -6.227514, 106.818225, 'Corner A'),
--     ('yard-main', 2, -6.227200, 106.819500, 'Corner B'),
--     ('yard-main', 3, -6.226500, 106.820025, 'Corner C'),
--     ('yard-main', 4, -6.225714, 106.819800, 'Corner D'),
--     ('yard-main', 5, -6.226000, 106.818225, 'Corner E');


-- ═══════════════════════════════════════════════════════════
-- NOTES PENTING:
-- ═══════════════════════════════════════════════════════════
-- • 1 derajat latitude ≈ 111 km (konstan di seluruh dunia)
-- • 1 derajat longitude ≈ 111 km * cos(latitude) (bervariasi per latitude)
-- • Yard default berukuran ~200m x 200m (0.0018° x 0.0018°)
-- • Minimal 3 titik untuk polygon valid
-- • Titik akan di-connect sesuai point_order untuk membentuk boundary
-- • Frontend menggunakan ray-casting algorithm untuk validasi posisi ESP32
-- • ON DELETE CASCADE: jika yard dihapus, semua polygon points ikut terhapus
-- ═══════════════════════════════════════════════════════════
