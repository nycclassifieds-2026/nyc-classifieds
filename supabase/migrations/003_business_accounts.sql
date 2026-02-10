-- Business accounts support
-- Run this in Supabase SQL Editor

-- Account type
ALTER TABLE users ADD COLUMN account_type TEXT NOT NULL DEFAULT 'personal';
ALTER TABLE users ADD CONSTRAINT chk_account_type CHECK (account_type IN ('personal', 'business'));

-- Business profile fields
ALTER TABLE users ADD COLUMN business_name TEXT;
ALTER TABLE users ADD COLUMN business_slug TEXT UNIQUE;
ALTER TABLE users ADD COLUMN business_category TEXT;
ALTER TABLE users ADD COLUMN business_description TEXT;
ALTER TABLE users ADD COLUMN website TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN hours JSONB;
ALTER TABLE users ADD COLUMN service_area TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE users ADD COLUMN photo_gallery TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX idx_users_account_type ON users(account_type);
CREATE INDEX idx_users_business_slug ON users(business_slug) WHERE business_slug IS NOT NULL;
CREATE INDEX idx_users_business_category ON users(business_category) WHERE business_category IS NOT NULL;
