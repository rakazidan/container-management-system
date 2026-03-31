-- ============================================================
-- Migration 002: Seed Data
-- Replicates mock data from frontend mockGPSData.ts
-- ============================================================

-- Area
INSERT INTO tb_m_area (area_id, area_name, description) VALUES
    ('area-01', 'Main Yard', 'Area utama container yard Jakarta')
ON CONFLICT (area_id) DO NOTHING;

-- Shipping Agents (sesuai dengan frontend mock data)
INSERT INTO tb_m_shipping_agent (agent_id, agent_name, code) VALUES
    ('AG001', 'Maersk Line',  'MSCU'),
    ('AG002', 'MSC',          'MSCU'),
    ('AG003', 'CMA CGM',      'CMAU'),
    ('AG004', 'COSCO',        'COSU'),
    ('AG005', 'Hapag-Lloyd',  'HLXU'),
    ('AG006', 'ONE',          'ONEY'),
    ('AG007', 'Evergreen',    'EISU'),
    ('AG008', 'Yang Ming',    'YMLU')
ON CONFLICT (agent_id) DO NOTHING;

-- ============================================================
-- Zones (20 zones, grid 5 cols x 4 rows)
-- Yard bounds: lat -6.2000 to -6.2100, lon 106.8000 to 106.8100
-- zoneWidth  = 0.0100 / 5 = 0.0020
-- zoneHeight = 0.0100 / 4 = 0.0025
-- ============================================================

INSERT INTO tb_m_zone
    (zone_id, zone_name, area_id,
     latlong_upleft, latlong_downleft, latlong_upright, latlong_downright,
     center_latitude, center_longitude)
VALUES
-- Row 0 (lat top=-6.2000, bottom=-6.2025)
('zone-A','A','area-01', '{"latitude":-6.2000,"longitude":106.8000}','{"latitude":-6.2025,"longitude":106.8000}','{"latitude":-6.2000,"longitude":106.8020}','{"latitude":-6.2025,"longitude":106.8020}', -6.20125, 106.80100),
('zone-B','B','area-01', '{"latitude":-6.2000,"longitude":106.8020}','{"latitude":-6.2025,"longitude":106.8020}','{"latitude":-6.2000,"longitude":106.8040}','{"latitude":-6.2025,"longitude":106.8040}', -6.20125, 106.80300),
('zone-C','C','area-01', '{"latitude":-6.2000,"longitude":106.8040}','{"latitude":-6.2025,"longitude":106.8040}','{"latitude":-6.2000,"longitude":106.8060}','{"latitude":-6.2025,"longitude":106.8060}', -6.20125, 106.80500),
('zone-D','D','area-01', '{"latitude":-6.2000,"longitude":106.8060}','{"latitude":-6.2025,"longitude":106.8060}','{"latitude":-6.2000,"longitude":106.8080}','{"latitude":-6.2025,"longitude":106.8080}', -6.20125, 106.80700),
('zone-E','E','area-01', '{"latitude":-6.2000,"longitude":106.8080}','{"latitude":-6.2025,"longitude":106.8080}','{"latitude":-6.2000,"longitude":106.8100}','{"latitude":-6.2025,"longitude":106.8100}', -6.20125, 106.80900),
-- Row 1 (lat top=-6.2025, bottom=-6.2050)
('zone-F','F','area-01', '{"latitude":-6.2025,"longitude":106.8000}','{"latitude":-6.2050,"longitude":106.8000}','{"latitude":-6.2025,"longitude":106.8020}','{"latitude":-6.2050,"longitude":106.8020}', -6.20375, 106.80100),
('zone-G','G','area-01', '{"latitude":-6.2025,"longitude":106.8020}','{"latitude":-6.2050,"longitude":106.8020}','{"latitude":-6.2025,"longitude":106.8040}','{"latitude":-6.2050,"longitude":106.8040}', -6.20375, 106.80300),
('zone-H','H','area-01', '{"latitude":-6.2025,"longitude":106.8040}','{"latitude":-6.2050,"longitude":106.8040}','{"latitude":-6.2025,"longitude":106.8060}','{"latitude":-6.2050,"longitude":106.8060}', -6.20375, 106.80500),
('zone-I','I','area-01', '{"latitude":-6.2025,"longitude":106.8060}','{"latitude":-6.2050,"longitude":106.8060}','{"latitude":-6.2025,"longitude":106.8080}','{"latitude":-6.2050,"longitude":106.8080}', -6.20375, 106.80700),
('zone-J','J','area-01', '{"latitude":-6.2025,"longitude":106.8080}','{"latitude":-6.2050,"longitude":106.8080}','{"latitude":-6.2025,"longitude":106.8100}','{"latitude":-6.2050,"longitude":106.8100}', -6.20375, 106.80900),
-- Row 2 (lat top=-6.2050, bottom=-6.2075)
('zone-K','K','area-01', '{"latitude":-6.2050,"longitude":106.8000}','{"latitude":-6.2075,"longitude":106.8000}','{"latitude":-6.2050,"longitude":106.8020}','{"latitude":-6.2075,"longitude":106.8020}', -6.20625, 106.80100),
('zone-L','L','area-01', '{"latitude":-6.2050,"longitude":106.8020}','{"latitude":-6.2075,"longitude":106.8020}','{"latitude":-6.2050,"longitude":106.8040}','{"latitude":-6.2075,"longitude":106.8040}', -6.20625, 106.80300),
('zone-M','M','area-01', '{"latitude":-6.2050,"longitude":106.8040}','{"latitude":-6.2075,"longitude":106.8040}','{"latitude":-6.2050,"longitude":106.8060}','{"latitude":-6.2075,"longitude":106.8060}', -6.20625, 106.80500),
('zone-N','N','area-01', '{"latitude":-6.2050,"longitude":106.8060}','{"latitude":-6.2075,"longitude":106.8060}','{"latitude":-6.2050,"longitude":106.8080}','{"latitude":-6.2075,"longitude":106.8080}', -6.20625, 106.80700),
('zone-O','O','area-01', '{"latitude":-6.2050,"longitude":106.8080}','{"latitude":-6.2075,"longitude":106.8080}','{"latitude":-6.2050,"longitude":106.8100}','{"latitude":-6.2075,"longitude":106.8100}', -6.20625, 106.80900),
-- Row 3 (lat top=-6.2075, bottom=-6.2100)
('zone-P','P','area-01', '{"latitude":-6.2075,"longitude":106.8000}','{"latitude":-6.2100,"longitude":106.8000}','{"latitude":-6.2075,"longitude":106.8020}','{"latitude":-6.2100,"longitude":106.8020}', -6.20875, 106.80100),
('zone-Q','Q','area-01', '{"latitude":-6.2075,"longitude":106.8020}','{"latitude":-6.2100,"longitude":106.8020}','{"latitude":-6.2075,"longitude":106.8040}','{"latitude":-6.2100,"longitude":106.8040}', -6.20875, 106.80300),
('zone-R','R','area-01', '{"latitude":-6.2075,"longitude":106.8040}','{"latitude":-6.2100,"longitude":106.8040}','{"latitude":-6.2075,"longitude":106.8060}','{"latitude":-6.2100,"longitude":106.8060}', -6.20875, 106.80500),
('zone-S','S','area-01', '{"latitude":-6.2075,"longitude":106.8060}','{"latitude":-6.2100,"longitude":106.8060}','{"latitude":-6.2075,"longitude":106.8080}','{"latitude":-6.2100,"longitude":106.8080}', -6.20875, 106.80700),
('zone-T','T','area-01', '{"latitude":-6.2075,"longitude":106.8080}','{"latitude":-6.2100,"longitude":106.8080}','{"latitude":-6.2075,"longitude":106.8100}','{"latitude":-6.2100,"longitude":106.8100}', -6.20875, 106.80900)
ON CONFLICT (zone_id) DO NOTHING;

-- ============================================================
-- Containers (~35 containers tersebar di berbagai zones)
-- yard_in_date: dalam 30 hari terakhir dari 2025-12-01
-- ============================================================

INSERT INTO tb_m_container (container_id, container_number, agent_id, zone_id, stack_level, yard_in_date) VALUES
-- Zone A (3 containers)
('c-zone-A-L1','MSCU1234567','AG001','zone-A',1,'2025-11-15 08:30:45'),
('c-zone-A-L2','TCLU9876543','AG002','zone-A',2,'2025-11-20 14:22:10'),
('c-zone-A-L3','CSNU5551234','AG003','zone-A',3,'2025-11-28 09:15:30'),
-- Zone B (1 container)
('c-zone-B-L1','HLXU7773331','AG005','zone-B',1,'2025-12-01 06:00:00'),
-- Zone C (4 containers)
('c-zone-C-L1','MSCU2345678','AG001','zone-C',1,'2025-11-10 07:00:00'),
('c-zone-C-L2','COSU4444444','AG004','zone-C',2,'2025-11-12 11:00:00'),
('c-zone-C-L3','YLMU8888888','AG008','zone-C',3,'2025-11-18 15:00:00'),
('c-zone-C-L4','TCLU1111222','AG002','zone-C',4,'2025-11-25 10:00:00'),
-- Zone D (2 containers)
('c-zone-D-L1','EISU6669991','AG007','zone-D',1,'2025-11-22 08:00:00'),
('c-zone-D-L2','MSCU3456789','AG001','zone-D',2,'2025-11-30 13:00:00'),
-- Zone E (0: empty, skip)
-- Zone F (3 containers)
('c-zone-F-L1','CMAU9992221','AG003','zone-F',1,'2025-11-16 09:00:00'),
('c-zone-F-L2','HLXU5553331','AG005','zone-F',2,'2025-11-19 16:00:00'),
('c-zone-F-L3','ONEY7777771','AG006','zone-F',3,'2025-11-27 11:00:00'),
-- Zone G (1 container)
('c-zone-G-L1','MSCU4567890','AG001','zone-G',1,'2025-12-05 07:30:00'),
-- Zone H (2 containers)
('c-zone-H-L1','TCLU3332211','AG002','zone-H',1,'2025-11-14 10:00:00'),
('c-zone-H-L2','COSU1115551','AG004','zone-H',2,'2025-11-21 14:00:00'),
-- Zone I (4 containers - full)
('c-zone-I-L1','EISU2228881','AG007','zone-I',1,'2025-11-08 06:00:00'),
('c-zone-I-L2','MSCU5678901','AG001','zone-I',2,'2025-11-11 09:00:00'),
('c-zone-I-L3','HLXU4446661','AG005','zone-I',3,'2025-11-17 12:00:00'),
('c-zone-I-L4','YLMU9993331','AG008','zone-I',4,'2025-11-24 15:00:00'),
-- Zone J (empty)
-- Zone K (2 containers)
('c-zone-K-L1','CMAU7771111','AG003','zone-K',1,'2025-11-13 08:00:00'),
('c-zone-K-L2','TCLU4443211','AG002','zone-K',2,'2025-11-26 11:00:00'),
-- Zone L (1 container)
('c-zone-L-L1','MSCU6789012','AG001','zone-L',1,'2025-12-03 07:00:00'),
-- Zone M (3 containers)
('c-zone-M-L1','COSU2226661','AG004','zone-M',1,'2025-11-09 09:00:00'),
('c-zone-M-L2','EISU3331111','AG007','zone-M',2,'2025-11-15 13:00:00'),
('c-zone-M-L3','ONEY5554441','AG006','zone-M',3,'2025-11-23 16:00:00'),
-- Zone N (empty)
-- Zone O (2 containers)
('c-zone-O-L1','HLXU2221111','AG005','zone-O',1,'2025-11-20 10:00:00'),
('c-zone-O-L2','MSCU7890123','AG001','zone-O',2,'2025-11-29 14:00:00'),
-- Zone P (1 container)
('c-zone-P-L1','TCLU5556781','AG002','zone-P',1,'2025-12-04 08:00:00'),
-- Zone Q (4 containers - full)
('c-zone-Q-L1','CMAU1113331','AG003','zone-Q',1,'2025-11-07 07:00:00'),
('c-zone-Q-L2','COSU3338881','AG004','zone-Q',2,'2025-11-10 10:00:00'),
('c-zone-Q-L3','YLMU1114441','AG008','zone-Q',3,'2025-11-16 13:00:00'),
('c-zone-Q-L4','EISU8881111','AG007','zone-Q',4,'2025-11-22 16:00:00'),
-- Zone R (2 containers)
('c-zone-R-L1','MSCU8901234','AG001','zone-R',1,'2025-11-18 09:00:00'),
('c-zone-R-L2','ONEY2226661','AG006','zone-R',2,'2025-11-27 12:00:00')
-- Zone S, T: empty
ON CONFLICT (container_id) DO NOTHING;

-- ============================================================
-- History movement logs (dummy data untuk dashboard)
-- ============================================================

INSERT INTO tb_l_history_container
    (container_number, from_zone_id, to_zone_id, from_stack_level, to_stack_level, operator, moved_at)
VALUES
('TCLU1234567', 'zone-A', 'zone-B', 3, 1, 'Controller 1', '2025-11-30 14:30:00'),
('MSCU9876543', 'zone-C', 'zone-A', 4, 2, 'Controller 2', '2025-11-30 13:45:00'),
('CMAU5551234', 'zone-B', 'zone-D', 2, 3, 'Controller 1', '2025-11-30 12:20:00'),
('HLXU7778888', 'zone-D', 'zone-E', 1, 4, 'Controller 3', '2025-11-30 11:15:00'),
('ONEY4445566', 'zone-E', 'zone-C', 3, 1, 'Controller 2', '2025-11-30 10:30:00'),
('TCLU2223344', 'zone-A', 'zone-B', 2, 4, 'Controller 1', '2025-11-30 09:45:00'),
('MSCU6667788', 'zone-B', 'zone-A', 4, 2, 'Controller 4', '2025-11-30 09:00:00'),
('CMAU9990011', 'zone-C', 'zone-D', 1, 3, 'Controller 2', '2025-11-29 16:30:00'),
('HLXU3334455', 'zone-D', 'zone-E', 3, 1, 'Controller 1', '2025-11-29 15:45:00'),
('ONEY1112233', 'zone-E', 'zone-A', 2, 4, 'Controller 3', '2025-11-29 14:20:00'),
('TCLU5556677', 'zone-A', 'zone-B', 1, 2, 'Controller 2', '2025-11-29 13:15:00'),
('MSCU8889900', 'zone-B', 'zone-C', 3, 1, 'Controller 1', '2025-11-29 12:30:00'),
('CMAU2221133', 'zone-C', 'zone-D', 4, 2, 'Controller 4', '2025-11-29 11:45:00'),
('HLXU6665544', 'zone-D', 'zone-E', 1, 3, 'Controller 2', '2025-11-29 10:00:00'),
('ONEY9998877', 'zone-E', 'zone-A', 4, 1, 'Controller 1', '2025-11-29 09:15:00'),
('TCLU3332211', 'zone-A', 'zone-B', 4, 3, 'Controller 3', '2025-11-28 16:30:00'),
('MSCU7776655', 'zone-B', 'zone-C', 1, 2, 'Controller 2', '2025-11-28 15:45:00'),
('CMAU4443322', 'zone-C', 'zone-D', 3, 4, 'Controller 1', '2025-11-28 14:20:00'),
('HLXU1119988', 'zone-D', 'zone-E', 2, 1, 'Controller 4', '2025-11-28 13:15:00'),
('ONEY5554433', 'zone-E', 'zone-A', 4, 2, 'Controller 2', '2025-11-28 12:30:00');
