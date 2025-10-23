-- =============================================
-- СХЕМА: Холды мест (TTL) для бронирований трансферов
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS transfer_seat_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES transfer_schedules(id) ON DELETE CASCADE,
  requested_seats INTEGER NOT NULL CHECK (requested_seats > 0),
  status VARCHAR(16) NOT NULL DEFAULT 'held' CHECK (status IN ('held','consumed','cancelled','expired')),
  expires_at TIMESTAMP NOT NULL,
  idempotency_key VARCHAR(100),
  client_fingerprint VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Уникальность идемпотентного ключа (если указан)
CREATE UNIQUE INDEX IF NOT EXISTS ux_transfer_seat_holds_idempotency
  ON transfer_seat_holds(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Индексы для быстрого поиска активных холдов
CREATE INDEX IF NOT EXISTS idx_transfer_seat_holds_schedule
  ON transfer_seat_holds(schedule_id);
CREATE INDEX IF NOT EXISTS idx_transfer_seat_holds_active
  ON transfer_seat_holds(schedule_id, status, expires_at);

-- Обновление updated_at
CREATE OR REPLACE FUNCTION update_transfer_seat_holds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_transfer_seat_holds_updated_at
  BEFORE UPDATE ON transfer_seat_holds
  FOR EACH ROW EXECUTE FUNCTION update_transfer_seat_holds_updated_at();

-- Пометка протухших холдов
CREATE OR REPLACE FUNCTION expire_transfer_seat_holds()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE transfer_seat_holds
    SET status = 'expired', updated_at = NOW()
  WHERE status = 'held' AND expires_at <= NOW();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
