-- Script para poblar las fechas de los partidos del Mundial 2026
-- Los partidos se distribuyen a lo largo de la fase de grupos
-- Ajusta estas fechas según el calendario oficial del torneo

-- Jornada 1 - Grupos A, B, C, D (Días 1-2)
UPDATE matches SET match_date = '2026-06-11 13:00:00-04' WHERE id = 1;  -- Mexico vs South Africa
UPDATE matches SET match_date = '2026-06-11 16:00:00-04' WHERE id = 2;  -- South Korea vs Czechia
UPDATE matches SET match_date = '2026-06-11 19:00:00-04' WHERE id = 7;  -- Canada vs Bosnia
UPDATE matches SET match_date = '2026-06-12 13:00:00-04' WHERE id = 8;  -- Qatar vs Switzerland
UPDATE matches SET match_date = '2026-06-12 16:00:00-04' WHERE id = 13; -- Brazil vs Morocco
UPDATE matches SET match_date = '2026-06-12 19:00:00-04' WHERE id = 14; -- Haiti vs Scotland
UPDATE matches SET match_date = '2026-06-13 13:00:00-04' WHERE id = 19; -- USA vs Paraguay
UPDATE matches SET match_date = '2026-06-13 16:00:00-04' WHERE id = 20; -- Australia vs Türkiye

-- Jornada 1 - Grupos E, F, G, H (Días 3-4)
UPDATE matches SET match_date = '2026-06-13 19:00:00-04' WHERE id = 25; -- Grupo E
UPDATE matches SET match_date = '2026-06-14 13:00:00-04' WHERE id = 26; -- Grupo E
UPDATE matches SET match_date = '2026-06-14 16:00:00-04' WHERE id = 31; -- Grupo F
UPDATE matches SET match_date = '2026-06-14 19:00:00-04' WHERE id = 32; -- Grupo F
UPDATE matches SET match_date = '2026-06-15 13:00:00-04' WHERE id = 37; -- Grupo G
UPDATE matches SET match_date = '2026-06-15 16:00:00-04' WHERE id = 38; -- Grupo G
UPDATE matches SET match_date = '2026-06-15 19:00:00-04' WHERE id = 43; -- Grupo H
UPDATE matches SET match_date = '2026-06-16 13:00:00-04' WHERE id = 44; -- Grupo H

-- Jornada 1 - Grupos I, J, K, L (Días 5-6)
UPDATE matches SET match_date = '2026-06-16 16:00:00-04' WHERE id = 49; -- Grupo I
UPDATE matches SET match_date = '2026-06-16 19:00:00-04' WHERE id = 50; -- Grupo I
UPDATE matches SET match_date = '2026-06-17 13:00:00-04' WHERE id = 55; -- Grupo J
UPDATE matches SET match_date = '2026-06-17 16:00:00-04' WHERE id = 56; -- Grupo J
UPDATE matches SET match_date = '2026-06-17 19:00:00-04' WHERE id = 61; -- Grupo K
UPDATE matches SET match_date = '2026-06-18 13:00:00-04' WHERE id = 62; -- Grupo K
UPDATE matches SET match_date = '2026-06-18 16:00:00-04' WHERE id = 67; -- Grupo L
UPDATE matches SET match_date = '2026-06-18 19:00:00-04' WHERE id = 68; -- Grupo L

-- Jornada 2 - Grupos A, B, C, D (Días 7-8)
UPDATE matches SET match_date = '2026-06-19 13:00:00-04' WHERE id = 3;  -- México vs South Korea
UPDATE matches SET match_date = '2026-06-19 16:00:00-04' WHERE id = 4;  -- Czechia vs South Africa
UPDATE matches SET match_date = '2026-06-19 19:00:00-04' WHERE id = 9;  -- Canada vs Qatar
UPDATE matches SET match_date = '2026-06-20 13:00:00-04' WHERE id = 10; -- Bosnia vs Switzerland
UPDATE matches SET match_date = '2026-06-20 16:00:00-04' WHERE id = 15; -- Brazil vs Haiti
UPDATE matches SET match_date = '2026-06-20 19:00:00-04' WHERE id = 16; -- Morocco vs Scotland
UPDATE matches SET match_date = '2026-06-21 13:00:00-04' WHERE id = 21; -- USA vs Australia
UPDATE matches SET match_date = '2026-06-21 16:00:00-04' WHERE id = 22; -- Paraguay vs Türkiye

-- Jornada 2 - Grupos E, F, G, H (Días 9-10)
UPDATE matches SET match_date = '2026-06-21 19:00:00-04' WHERE id = 27; -- Grupo E
UPDATE matches SET match_date = '2026-06-22 13:00:00-04' WHERE id = 28; -- Grupo E
UPDATE matches SET match_date = '2026-06-22 16:00:00-04' WHERE id = 33; -- Grupo F
UPDATE matches SET match_date = '2026-06-22 19:00:00-04' WHERE id = 34; -- Grupo F
UPDATE matches SET match_date = '2026-06-23 13:00:00-04' WHERE id = 39; -- Grupo G
UPDATE matches SET match_date = '2026-06-23 16:00:00-04' WHERE id = 40; -- Grupo G
UPDATE matches SET match_date = '2026-06-23 19:00:00-04' WHERE id = 45; -- Grupo H
UPDATE matches SET match_date = '2026-06-24 13:00:00-04' WHERE id = 46; -- Grupo H

-- Jornada 2 - Grupos I, J, K, L (Días 11-12)
UPDATE matches SET match_date = '2026-06-24 16:00:00-04' WHERE id = 51; -- Grupo I
UPDATE matches SET match_date = '2026-06-24 19:00:00-04' WHERE id = 52; -- Grupo I
UPDATE matches SET match_date = '2026-06-25 13:00:00-04' WHERE id = 57; -- Grupo J
UPDATE matches SET match_date = '2026-06-25 16:00:00-04' WHERE id = 58; -- Grupo J
UPDATE matches SET match_date = '2026-06-25 19:00:00-04' WHERE id = 63; -- Grupo K
UPDATE matches SET match_date = '2026-06-26 13:00:00-04' WHERE id = 64; -- Grupo K
UPDATE matches SET match_date = '2026-06-26 16:00:00-04' WHERE id = 69; -- Grupo L
UPDATE matches SET match_date = '2026-06-26 19:00:00-04' WHERE id = 70; -- Grupo L

-- Jornada 3 - Grupos A, B (Día 13) - Partidos simultáneos
UPDATE matches SET match_date = '2026-06-27 15:00:00-04' WHERE id = 5;  -- Czechia vs México
UPDATE matches SET match_date = '2026-06-27 15:00:00-04' WHERE id = 6;  -- South Africa vs South Korea
UPDATE matches SET match_date = '2026-06-27 19:00:00-04' WHERE id = 11; -- Switzerland vs Canada
UPDATE matches SET match_date = '2026-06-27 19:00:00-04' WHERE id = 12; -- Bosnia vs Qatar

-- Jornada 3 - Grupos C, D (Día 14) - Partidos simultáneos
UPDATE matches SET match_date = '2026-06-28 15:00:00-04' WHERE id = 17; -- Scotland vs Brazil
UPDATE matches SET match_date = '2026-06-28 15:00:00-04' WHERE id = 18; -- Morocco vs Haiti
UPDATE matches SET match_date = '2026-06-28 19:00:00-04' WHERE id = 23; -- Türkiye vs USA
UPDATE matches SET match_date = '2026-06-28 19:00:00-04' WHERE id = 24; -- Paraguay vs Australia

-- Jornada 3 - Grupos E, F (Día 15) - Partidos simultáneos
UPDATE matches SET match_date = '2026-06-29 15:00:00-04' WHERE id = 29; -- Grupo E
UPDATE matches SET match_date = '2026-06-29 15:00:00-04' WHERE id = 30; -- Grupo E
UPDATE matches SET match_date = '2026-06-29 19:00:00-04' WHERE id = 35; -- Grupo F
UPDATE matches SET match_date = '2026-06-29 19:00:00-04' WHERE id = 36; -- Grupo F

-- Jornada 3 - Grupos G, H (Día 16) - Partidos simultáneos
UPDATE matches SET match_date = '2026-06-30 15:00:00-04' WHERE id = 41; -- Grupo G
UPDATE matches SET match_date = '2026-06-30 15:00:00-04' WHERE id = 42; -- Grupo G
UPDATE matches SET match_date = '2026-06-30 19:00:00-04' WHERE id = 47; -- Grupo H
UPDATE matches SET match_date = '2026-06-30 19:00:00-04' WHERE id = 48; -- Grupo H

-- Jornada 3 - Grupos I, J (Día 17) - Partidos simultáneos
UPDATE matches SET match_date = '2026-07-01 15:00:00-04' WHERE id = 53; -- Grupo I
UPDATE matches SET match_date = '2026-07-01 15:00:00-04' WHERE id = 54; -- Grupo I
UPDATE matches SET match_date = '2026-07-01 19:00:00-04' WHERE id = 59; -- Grupo J
UPDATE matches SET match_date = '2026-07-01 19:00:00-04' WHERE id = 60; -- Grupo J

-- Jornada 3 - Grupos K, L (Día 18) - Partidos simultáneos
UPDATE matches SET match_date = '2026-07-02 15:00:00-04' WHERE id = 65; -- Grupo K
UPDATE matches SET match_date = '2026-07-02 15:00:00-04' WHERE id = 66; -- Grupo K
UPDATE matches SET match_date = '2026-07-02 19:00:00-04' WHERE id = 71; -- Grupo L
UPDATE matches SET match_date = '2026-07-02 19:00:00-04' WHERE id = 72; -- Grupo L
