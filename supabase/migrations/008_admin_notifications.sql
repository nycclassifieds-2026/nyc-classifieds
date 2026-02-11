-- Admin notification log: tracks custom notifications and broadcasts sent by admins
CREATE TABLE admin_notifications (
  id              BIGSERIAL PRIMARY KEY,
  sender_id       BIGINT NOT NULL REFERENCES users(id),
  recipient_id    BIGINT REFERENCES users(id),
  title           TEXT NOT NULL,
  body            TEXT,
  link            TEXT,
  sent_notification BOOLEAN NOT NULL DEFAULT FALSE,
  sent_email      BOOLEAN NOT NULL DEFAULT FALSE,
  recipient_count INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_notifications_created ON admin_notifications(created_at DESC);
