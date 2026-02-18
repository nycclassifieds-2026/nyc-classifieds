-- Business reviews
CREATE TABLE IF NOT EXISTS reviews (
  id              BIGSERIAL PRIMARY KEY,
  business_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body            TEXT,
  reply           TEXT,
  replied_at      TIMESTAMPTZ,
  reported        BOOLEAN NOT NULL DEFAULT FALSE,
  report_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_business ON reviews(business_user_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_user_id);

-- Prevent duplicate reviews
CREATE UNIQUE INDEX idx_reviews_unique ON reviews(business_user_id, reviewer_user_id);
