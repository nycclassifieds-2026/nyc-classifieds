-- Admin roles & ban support
-- Run this in Supabase SQL Editor

-- Add role column to users
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE users ADD CONSTRAINT chk_user_role CHECK (role IN ('user', 'moderator', 'admin'));
CREATE INDEX idx_users_role ON users(role);

-- Add banned column to users
ALTER TABLE users ADD COLUMN banned BOOLEAN NOT NULL DEFAULT FALSE;

-- Seed admin account (update the email to match your account)
UPDATE users SET role = 'admin' WHERE email = 'jeff@nycclassifieds.com';
