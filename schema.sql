CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer','admin','owner')),
  trial_started_at TEXT NOT NULL,
  trial_ends_at TEXT NOT NULL,
  trial_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  report_number TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','completed')),
  report_date TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  site_name TEXT DEFAULT '',
  site_address TEXT DEFAULT '',
  contact_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  work_summary TEXT DEFAULT '',
  findings TEXT DEFAULT '',
  recommendations TEXT DEFAULT '',
  signature_r2_key TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS report_photos (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  original_name TEXT DEFAULT '',
  note TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT DEFAULT '',
  target_id TEXT DEFAULT '',
  metadata TEXT DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_user_updated ON reports(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_report_order ON report_photos(report_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
