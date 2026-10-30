-- ============================================================
-- Migration 002: Add Recurring Revenue Table
-- ============================================================

CREATE TABLE IF NOT EXISTS recurring_revenue (
  id                TEXT PRIMARY KEY NOT NULL,
  client_id         TEXT REFERENCES clients(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  frequency         TEXT NOT NULL DEFAULT 'monthly', -- monthly | yearly | quarterly
  currency          TEXT NOT NULL DEFAULT 'EUR',
  amount            REAL NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active', -- active | paused | cancelled
  start_date        INTEGER NOT NULL DEFAULT (unixepoch()),
  next_billing_date INTEGER,
  notes             TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_recurring_status ON recurring_revenue(status);
CREATE INDEX IF NOT EXISTS idx_recurring_client ON recurring_revenue(client_id);
