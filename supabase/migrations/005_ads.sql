-- ─── Ads ───────────────────────────────────────────────────────
-- Four placement types:
--   'neighborhood' → 1 ad per category per neighborhood (most specific)
--   'borough'      → 1 ad per category per borough (fallback)
--   'all-nyc'      → 1 ad per category city-wide (fallback)
--   'homepage'     → 1 banner ad on the homepage

CREATE TABLE IF NOT EXISTS ads (
  id            SERIAL PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('neighborhood', 'borough', 'all-nyc', 'homepage')),
  advertiser    TEXT NOT NULL,                -- business / contact name
  image_url     TEXT NOT NULL,                -- ad creative URL
  link_url      TEXT NOT NULL DEFAULT '',     -- click-through destination
  category_slug TEXT,                         -- required for neighborhood, borough, all-nyc
  borough_slug  TEXT,                         -- required for neighborhood, borough
  neighborhood_slug TEXT,                     -- required for neighborhood
  active        BOOLEAN NOT NULL DEFAULT true,
  starts_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active ad per category+neighborhood slot
CREATE UNIQUE INDEX ads_neighborhood_slot_unique
  ON ads (category_slug, borough_slug, neighborhood_slug)
  WHERE type = 'neighborhood' AND active = true;

-- Only one active ad per category+borough slot
CREATE UNIQUE INDEX ads_borough_slot_unique
  ON ads (category_slug, borough_slug)
  WHERE type = 'borough' AND active = true;

-- Only one active ad per category city-wide
CREATE UNIQUE INDEX ads_allnyc_slot_unique
  ON ads (category_slug)
  WHERE type = 'all-nyc' AND active = true;

-- Only one active homepage banner
CREATE UNIQUE INDEX ads_homepage_slot_unique
  ON ads (type)
  WHERE type = 'homepage' AND active = true;

-- Fast lookups
CREATE INDEX ads_active_type ON ads (type, active);
CREATE INDEX ads_expires ON ads (expires_at);
