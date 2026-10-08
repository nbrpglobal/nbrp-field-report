-- Apply this only if the existing D1 was created from the earlier production foundation schema
ALTER TABLE reports ADD COLUMN report_date TEXT;
ALTER TABLE reports ADD COLUMN customer_name TEXT;
ALTER TABLE reports ADD COLUMN site_name TEXT;
ALTER TABLE reports ADD COLUMN site_address TEXT;
ALTER TABLE reports ADD COLUMN contact_name TEXT;
ALTER TABLE reports ADD COLUMN contact_phone TEXT;
ALTER TABLE reports ADD COLUMN contact_email TEXT;
ALTER TABLE reports ADD COLUMN work_summary TEXT;
ALTER TABLE reports ADD COLUMN findings TEXT;
ALTER TABLE reports ADD COLUMN recommendations TEXT;
ALTER TABLE reports ADD COLUMN storage_mode TEXT NOT NULL DEFAULT 'send_delete';
ALTER TABLE reports ADD COLUMN expires_at TEXT;
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON reports(user_id,report_date DESC);
CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY,user_id TEXT NOT NULL UNIQUE,stripe_customer_id TEXT,stripe_subscription_id TEXT UNIQUE,stripe_price_id TEXT,plan TEXT,status TEXT,current_period_start TEXT,current_period_end TEXT,cancel_at_period_end INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS stripe_events (event_id TEXT PRIMARY KEY,type TEXT NOT NULL,processed_at TEXT NOT NULL,status TEXT NOT NULL,payload_hash TEXT);
CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,stripe_invoice_id TEXT,stripe_payment_intent_id TEXT,amount INTEGER,currency TEXT,status TEXT,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
