-- Blocked users table for messaging
CREATE TABLE blocked_users (
  id          BIGSERIAL PRIMARY KEY,
  blocker_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
CREATE INDEX idx_blocked_blocker ON blocked_users(blocker_id);
