CREATE TABLE IF NOT EXISTS nl_events (
  event TEXT NOT NULL,
  source TEXT NOT NULL,
  campaign TEXT NOT NULL,
  product TEXT NOT NULL,
  click_id TEXT NOT NULL,
  dest_kind TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  PRIMARY KEY (event, click_id)
);

CREATE INDEX IF NOT EXISTS nl_events_occurred_at ON nl_events (occurred_at);
