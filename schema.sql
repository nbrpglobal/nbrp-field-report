PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'customer',company TEXT,created_at TEXT NOT NULL,trial_started_at TEXT NOT NULL,
 trial_ends_at TEXT NOT NULL,trial_consumed INTEGER NOT NULL DEFAULT 1,subscription_status TEXT NOT NULL DEFAULT 'none',
 stripe_customer_id TEXT,disabled INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,expires_at TEXT NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE TABLE IF NOT EXISTS daily_counters (day TEXT PRIMARY KEY,value INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS reports (
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL,report_number TEXT NOT NULL UNIQUE,status TEXT NOT NULL DEFAULT 'draft',
 report_date TEXT,customer_name TEXT,site_name TEXT,site_address TEXT,contact_name TEXT,contact_phone TEXT,contact_email TEXT,
 work_summary TEXT,findings TEXT,recommendations TEXT,signature_key TEXT,storage_mode TEXT NOT NULL DEFAULT 'send_delete',
expires_at TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,deleted_at TEXT,
FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_reports_user_updated ON reports(user_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON reports(user_id,report_date DESC);
CREATE TABLE IF NOT EXISTS photos (
 id TEXT PRIMARY KEY,report_id TEXT NOT NULL,object_key TEXT NOT NULL,original_name TEXT,mime_type TEXT,size_bytes INTEGER,
 sort_order INTEGER NOT NULL DEFAULT 0,note TEXT NOT NULL DEFAULT '',rotation INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,
 FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_photos_report_order ON photos(report_id,sort_order);
CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY,user_id TEXT,action TEXT NOT NULL,entity_type TEXT,entity_id TEXT,ip_hash TEXT,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY,user_id TEXT NOT NULL UNIQUE,stripe_customer_id TEXT,stripe_subscription_id TEXT UNIQUE,stripe_price_id TEXT,plan TEXT,status TEXT,current_period_start TEXT,current_period_end TEXT,cancel_at_period_end INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS stripe_events (event_id TEXT PRIMARY KEY,type TEXT NOT NULL,processed_at TEXT NOT NULL,status TEXT NOT NULL,payload_hash TEXT);
CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,stripe_invoice_id TEXT,stripe_payment_intent_id TEXT,amount INTEGER,currency TEXT,status TEXT,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
