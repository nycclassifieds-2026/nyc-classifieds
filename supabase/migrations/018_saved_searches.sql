CREATE TABLE saved_searches (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  keywords    TEXT,
  category    TEXT,
  subcategory TEXT,
  min_price   INTEGER,
  max_price   INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
