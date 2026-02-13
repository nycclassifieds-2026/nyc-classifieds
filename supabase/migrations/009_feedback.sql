CREATE TABLE feedback (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  email       TEXT,
  category    TEXT NOT NULL CHECK (category IN ('bug','feature','general','other')),
  message     TEXT NOT NULL,
  page_url    TEXT,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','in_progress','resolved','dismissed')),
  admin_reply TEXT,
  replied_by  BIGINT REFERENCES users(id),
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_status ON feedback(status, created_at DESC);
CREATE INDEX idx_feedback_user ON feedback(user_id);
