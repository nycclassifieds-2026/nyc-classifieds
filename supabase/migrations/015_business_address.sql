-- Business address field
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_address TEXT;
