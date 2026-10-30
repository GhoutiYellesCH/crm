-- ============================================================
-- Personal CRM — Initial Schema (v1)
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY NOT NULL,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE,
  password_hash TEXT,
  role        TEXT NOT NULL DEFAULT 'member', -- owner | member | viewer
  avatar_url  TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Insert default owner on first run
INSERT OR IGNORE INTO users (id, name, email, role, is_active)
VALUES ('owner-default', 'Me', NULL, 'owner', 1);

-- ------------------------------------------------------------
-- CLIENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id            TEXT PRIMARY KEY NOT NULL,
  name          TEXT NOT NULL,
  company       TEXT,
  company_size  TEXT, -- '1-10' | '11-50' | '51-200' | '200+'
  industry      TEXT,
  country       TEXT,
  city          TEXT,
  email         TEXT,
  phone         TEXT,
  website       TEXT,
  linkedin      TEXT,
  status        TEXT NOT NULL DEFAULT 'lead', -- lead | prospect | proposal | active | inactive | closed
  lead_score    REAL DEFAULT 0,
  service_tags  TEXT DEFAULT '[]', -- JSON array of service tags
  currency      TEXT DEFAULT 'EUR',
  notes         TEXT,
  source        TEXT, -- how did you find them
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- CONTACTS (people within a client company)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id          TEXT PRIMARY KEY NOT NULL,
  client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT,
  email       TEXT,
  phone       TEXT,
  linkedin    TEXT,
  is_primary  INTEGER NOT NULL DEFAULT 0,
  notes       TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id            TEXT PRIMARY KEY NOT NULL,
  client_id     TEXT REFERENCES clients(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active', -- active | paused | completed | cancelled
  service_type  TEXT NOT NULL, -- ai_automation | secure_app | security_audit | photography | video | branding | ads_funnels | other
  checklist     TEXT DEFAULT '[]', -- JSON array: [{id, text, done}]
  start_date    INTEGER,
  due_date      INTEGER,
  completed_at  INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- TASKS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id            TEXT PRIMARY KEY NOT NULL,
  project_id    TEXT REFERENCES projects(id) ON DELETE SET NULL,
  client_id     TEXT REFERENCES clients(id) ON DELETE SET NULL,
  assigned_to   TEXT REFERENCES users(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'todo', -- todo | in_progress | review | done | cancelled
  priority      TEXT NOT NULL DEFAULT 'medium', -- low | medium | high | urgent
  due_date      INTEGER,
  tags          TEXT DEFAULT '[]', -- JSON array
  position      INTEGER DEFAULT 0, -- for kanban ordering
  completed_at  INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- NOTES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
  id          TEXT PRIMARY KEY NOT NULL,
  client_id   TEXT REFERENCES clients(id) ON DELETE CASCADE,
  project_id  TEXT REFERENCES projects(id) ON DELETE CASCADE,
  task_id     TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- INVOICES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id              TEXT PRIMARY KEY NOT NULL,
  client_id       TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  project_id      TEXT REFERENCES projects(id) ON DELETE SET NULL,
  number          TEXT NOT NULL UNIQUE, -- INV-2026-001
  status          TEXT NOT NULL DEFAULT 'draft', -- draft | sent | paid | overdue | cancelled
  currency        TEXT NOT NULL DEFAULT 'EUR',
  subtotal        REAL NOT NULL DEFAULT 0,
  tax_rate        REAL NOT NULL DEFAULT 0, -- percentage e.g. 19
  tax_amount      REAL NOT NULL DEFAULT 0,
  discount        REAL NOT NULL DEFAULT 0,
  total           REAL NOT NULL DEFAULT 0,
  total_eur       REAL,                  -- EUR equivalent at time of invoice
  exchange_rate   REAL,
  line_items      TEXT DEFAULT '[]',    -- JSON: [{description, qty, unit_price, total}]
  notes           TEXT,
  issue_date      INTEGER NOT NULL DEFAULT (unixepoch()),
  due_date        INTEGER,
  paid_at         INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- TRANSACTIONS (income / expense)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id              TEXT PRIMARY KEY NOT NULL,
  invoice_id      TEXT REFERENCES invoices(id) ON DELETE SET NULL,
  type            TEXT NOT NULL, -- income | expense
  category        TEXT,         -- for expense: software | hardware | travel | team | marketing | other
  currency        TEXT NOT NULL DEFAULT 'EUR',
  amount          REAL NOT NULL,
  amount_eur      REAL,          -- EUR equivalent
  exchange_rate   REAL,
  date            INTEGER NOT NULL DEFAULT (unixepoch()),
  description     TEXT,
  notes           TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- BOOKMARKS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookmarks (
  id          TEXT PRIMARY KEY NOT NULL,
  url         TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  favicon_url TEXT,
  og_image    TEXT,
  category    TEXT NOT NULL DEFAULT 'info', -- tools | articles | my_projects | info
  tags        TEXT DEFAULT '[]',            -- JSON array
  is_pinned   INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- LEADS (the lead gen funnel pool)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id                  TEXT PRIMARY KEY NOT NULL,
  company_name        TEXT NOT NULL,
  website             TEXT,
  industry            TEXT,
  country             TEXT,
  city                TEXT,
  company_size        TEXT,
  email               TEXT,
  phone               TEXT,
  linkedin            TEXT,
  decision_maker      TEXT,  -- name of contact person
  decision_maker_role TEXT,
  tech_stack          TEXT DEFAULT '[]',       -- JSON: detected technologies
  security_issues     TEXT DEFAULT '[]',       -- JSON: [{type, severity, detail}]
  whois_data          TEXT DEFAULT '{}',       -- JSON: domain age, registrar, etc
  shodan_data         TEXT DEFAULT '{}',       -- JSON: open ports, banners
  ssl_data            TEXT DEFAULT '{}',       -- JSON: cert validity, expiry
  headers_data        TEXT DEFAULT '{}',       -- JSON: security headers analysis
  lead_score          REAL DEFAULT 0,
  score_breakdown     TEXT DEFAULT '{}',       -- JSON: per-signal scores
  stage               TEXT NOT NULL DEFAULT 'discovered', -- discovered | enriched | scored | shortlisted | contacted | qualified | converted | rejected
  service_match       TEXT DEFAULT '[]',       -- JSON: matched services
  outreach_status     TEXT DEFAULT 'none',     -- none | emailed | called | replied | meeting | closed
  outreach_date       INTEGER,
  follow_up_date      INTEGER,
  source              TEXT,                    -- google_maps | apollo | crt_sh | manual
  notes               TEXT,
  converted_client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- OUTREACH (emails/calls log per lead)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS outreach_log (
  id          TEXT PRIMARY KEY NOT NULL,
  lead_id     TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type        TEXT NOT NULL, -- email | call | meeting | note
  subject     TEXT,
  content     TEXT,
  status      TEXT DEFAULT 'sent', -- sent | replied | no_response | bounced
  date        INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- CALENDAR EVENTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar_events (
  id          TEXT PRIMARY KEY NOT NULL,
  client_id   TEXT REFERENCES clients(id) ON DELETE SET NULL,
  task_id     TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  lead_id     TEXT REFERENCES leads(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT DEFAULT 'meeting', -- meeting | deadline | reminder | follow_up | team
  start_at    INTEGER NOT NULL,
  end_at      INTEGER NOT NULL,
  all_day     INTEGER NOT NULL DEFAULT 0,
  recurrence  TEXT,                   -- null | daily | weekly | monthly
  remind_at   INTEGER,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- AUDIT SESSIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_sessions (
  id           TEXT PRIMARY KEY NOT NULL,
  client_id    TEXT REFERENCES clients(id) ON DELETE SET NULL,
  project_id   TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  level        TEXT NOT NULL,  -- black_box | user | admin | full (all 3)
  status       TEXT NOT NULL DEFAULT 'in_progress', -- in_progress | completed | cancelled
  findings     TEXT DEFAULT '[]', -- JSON: [{id, title, severity, description, recommendation, status}]
  -- severity: critical | high | medium | low | info
  checklist    TEXT DEFAULT '{}', -- JSON: {black_box:[{id,text,done}], user:[...], admin:[...]}
  scope        TEXT,
  notes        TEXT,
  started_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- API KEYS (stored locally, for lead gen sources)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
  id          TEXT PRIMARY KEY NOT NULL,
  provider    TEXT NOT NULL UNIQUE, -- google_maps | hunter_io | shodan | apollo | wappalyzer
  api_key     TEXT NOT NULL,        -- stored as plain text (local app)
  is_active   INTEGER NOT NULL DEFAULT 1,
  notes       TEXT,
  last_used   INTEGER,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- SETTINGS (key-value store for app config)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY NOT NULL,
  value       TEXT NOT NULL,
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('theme', '"dark"'),
  ('language', '"en"'),
  ('currency_default', '"EUR"'),
  ('sidebar_collapsed', 'false'),
  ('invoice_next_number', '1'),
  ('invoice_prefix', '"INV"'),
  ('exchange_rates_updated', '0'),
  ('exchange_rates', '{}');

-- ------------------------------------------------------------
-- INDEXES for performance
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start_at);
CREATE INDEX IF NOT EXISTS idx_notes_client ON notes(client_id);
