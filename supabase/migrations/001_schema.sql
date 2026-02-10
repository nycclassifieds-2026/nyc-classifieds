-- NYC Classifieds — Full schema
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- Neighborhoods
-- ============================================================
CREATE TABLE neighborhoods (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  city        TEXT NOT NULL DEFAULT 'New York',
  state       TEXT NOT NULL DEFAULT 'NY',
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  boundary    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  pin             TEXT,  -- hashed 4-digit PIN
  address         TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  selfie_url      TEXT,
  selfie_geolat   DOUBLE PRECISION,
  selfie_geolon   DOUBLE PRECISION,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  neighborhood_id BIGINT REFERENCES neighborhoods(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- Verification codes (OTP)
-- ============================================================
CREATE TABLE user_verification_codes (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_email ON user_verification_codes(email, used);

-- ============================================================
-- Categories
-- ============================================================
CREATE TABLE categories (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  icon            TEXT,
  subcategories   JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Listings
-- ============================================================
CREATE TABLE listings (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  price           INTEGER,  -- cents, NULL = free / negotiable
  category_slug   TEXT NOT NULL,
  subcategory_slug TEXT,
  images          TEXT[] NOT NULL DEFAULT '{}',
  location        TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','expired','removed')),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_category ON listings(category_slug, status);
CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status, created_at DESC);
CREATE INDEX idx_listings_title_trgm ON listings USING gin (title gin_trgm_ops);
CREATE INDEX idx_listings_desc_trgm ON listings USING gin (description gin_trgm_ops);

-- ============================================================
-- Messages
-- ============================================================
CREATE TABLE messages (
  id            BIGSERIAL PRIMARY KEY,
  listing_id    BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_thread ON messages(listing_id, sender_id, recipient_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, read, created_at DESC);

-- ============================================================
-- Flagged content
-- ============================================================
CREATE TABLE flagged_content (
  id            BIGSERIAL PRIMARY KEY,
  reporter_id   BIGINT REFERENCES users(id),
  content_type  TEXT NOT NULL CHECK (content_type IN ('listing','user','message')),
  content_id    BIGINT NOT NULL,
  reason        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_flagged_status ON flagged_content(status, created_at DESC);

-- ============================================================
-- Audit log
-- ============================================================
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor       TEXT,
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   BIGINT,
  details     JSONB,
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id);

-- ============================================================
-- Seed categories
-- ============================================================
INSERT INTO categories (name, slug, icon, subcategories, sort_order) VALUES
  ('For Sale', 'for-sale', '🏷️', '["Electronics","Furniture","Clothing","Vehicles","Sports & Outdoors","Books & Media","Toys & Games","Other"]'::jsonb, 1),
  ('Housing', 'housing', '🏠', '["Apartments","Rooms","Sublets","Real Estate","Parking","Storage"]'::jsonb, 2),
  ('Services', 'services', '🔧', '["Home Repair","Cleaning","Tutoring","Beauty","Legal","Financial","Tech","Other"]'::jsonb, 3),
  ('Jobs', 'jobs', '💼', '["Full-time","Part-time","Freelance","Internships"]'::jsonb, 4),
  ('Community', 'community', '🤝', '["Events","Groups","Lost & Found","Volunteers","Announcements"]'::jsonb, 5),
  ('Gigs', 'gigs', '⚡', '["Quick Tasks","Events","Moving","Delivery","Other"]'::jsonb, 6);

-- ============================================================
-- Storage buckets (run via Supabase dashboard or API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('selfies', 'selfies', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true);
