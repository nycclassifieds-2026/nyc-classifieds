-- The Porch — Neighborhood Feed
-- porch_posts + porch_replies

-- ============================================================
-- Porch Posts
-- ============================================================
CREATE TABLE porch_posts (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type         TEXT NOT NULL CHECK (post_type IN (
    'recommendation','question','alert','lost-and-found','event',
    'stoop-sale','garage-sale','volunteer','carpool','pet-sighting',
    'welcome','group'
  )),
  title             TEXT NOT NULL CHECK (char_length(title) <= 100),
  body              TEXT NOT NULL CHECK (char_length(body) <= 500),
  borough_slug      TEXT NOT NULL,
  neighborhood_slug TEXT NOT NULL,
  pinned            BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_porch_posts_feed ON porch_posts(borough_slug, neighborhood_slug, created_at DESC);
CREATE INDEX idx_porch_posts_type ON porch_posts(post_type, created_at DESC);
CREATE INDEX idx_porch_posts_user ON porch_posts(user_id, created_at DESC);
CREATE INDEX idx_porch_posts_expires ON porch_posts(expires_at);

-- ============================================================
-- Porch Replies
-- ============================================================
CREATE TABLE porch_replies (
  id            BIGSERIAL PRIMARY KEY,
  post_id       BIGINT NOT NULL REFERENCES porch_posts(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body          TEXT NOT NULL CHECK (char_length(body) <= 300),
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_porch_replies_post ON porch_replies(post_id, created_at ASC);
CREATE INDEX idx_porch_replies_user ON porch_replies(user_id);

-- ============================================================
-- Porch Helpful Votes (prevent duplicates)
-- ============================================================
CREATE TABLE porch_helpful_votes (
  id        BIGSERIAL PRIMARY KEY,
  reply_id  BIGINT NOT NULL REFERENCES porch_replies(id) ON DELETE CASCADE,
  user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reply_id, user_id)
);
