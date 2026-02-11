CREATE TABLE signup_events (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL,
  step        TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('started','completed','failed')),
  error       TEXT,
  metadata    JSONB,
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_signup_events_funnel ON signup_events(step, status, created_at);
CREATE INDEX idx_signup_events_session ON signup_events(session_id);
