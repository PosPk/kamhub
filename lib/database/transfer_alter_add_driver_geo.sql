-- =============================================
-- ALTER: Добавление гео/рабочих полей водителя для матчера
-- =============================================

CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE transfer_drivers
  ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS working_hours JSONB,
  ADD COLUMN IF NOT EXISTS current_location geography(Point,4326);

-- Индекс по текущей геолокации водителя для ST_DWithin
CREATE INDEX IF NOT EXISTS idx_transfer_drivers_current_location
  ON transfer_drivers USING GIST (current_location);
