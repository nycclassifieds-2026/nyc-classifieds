-- Separate business profile photo (logo/storefront) from personal selfie
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_photo TEXT;
