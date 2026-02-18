-- Dual profile support: users with business accounts keep their personal identity
-- Listings/porch posts track which identity was used when posting

-- Add posting_as to listings (personal name vs business name)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS posting_as TEXT NOT NULL DEFAULT 'personal';
ALTER TABLE listings ADD CONSTRAINT listings_posting_as_check CHECK (posting_as IN ('personal', 'business'));

-- Add posting_as to porch_posts too
ALTER TABLE porch_posts ADD COLUMN IF NOT EXISTS posting_as TEXT NOT NULL DEFAULT 'personal';
ALTER TABLE porch_posts ADD CONSTRAINT porch_posts_posting_as_check CHECK (posting_as IN ('personal', 'business'));
