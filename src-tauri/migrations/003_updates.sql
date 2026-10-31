-- Migration 003: Project price/expenses, social links, contacts and activity tracking

-- Projects price and expenses
ALTER TABLE projects ADD COLUMN price REAL DEFAULT 0;
ALTER TABLE projects ADD COLUMN expenses REAL DEFAULT 0;
ALTER TABLE projects ADD COLUMN currency TEXT DEFAULT 'EUR';

-- Clients social links and extra contacts
ALTER TABLE clients ADD COLUMN instagram TEXT;
ALTER TABLE clients ADD COLUMN facebook TEXT;
ALTER TABLE clients ADD COLUMN additional_contacts TEXT DEFAULT '[]';

-- Leads multiple decision makers and extra contact info
ALTER TABLE leads ADD COLUMN decision_makers TEXT DEFAULT '[]';
ALTER TABLE leads ADD COLUMN additional_phones TEXT DEFAULT '[]';
ALTER TABLE leads ADD COLUMN additional_emails TEXT DEFAULT '[]';

-- Activity Log for heatmap and streak tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id          TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL, -- task | project | client | lead | invoice
  entity_id   TEXT,
  action      TEXT NOT NULL, -- completed | created | updated | contacted
  title       TEXT NOT NULL,
  metadata    TEXT DEFAULT '{}',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);
