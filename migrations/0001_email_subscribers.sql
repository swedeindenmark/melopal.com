CREATE TABLE IF NOT EXISTS email_subscribers (
  email TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'subscribed',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  source_path TEXT,
  source_url TEXT,
  referrer TEXT,
  country TEXT,
  user_agent TEXT,
  consent_text TEXT,
  marketing_platform TEXT,
  marketing_exported_at TEXT,
  export_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_status_updated
  ON email_subscribers(status, updated_at);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_exported
  ON email_subscribers(marketing_exported_at);
