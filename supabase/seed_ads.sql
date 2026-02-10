-- ─── Seed test ads ───────────────────────────────────────────
-- 1 homepage banner + 12 all-nyc ads (one per category)
-- These serve as city-wide fallbacks for every neighborhood

INSERT INTO ads (type, advertiser, image_url, link_url, category_slug) VALUES
  ('all-nyc', 'NYC Housing Co', 'https://placehold.co/728x90/dc2626/fff?text=Housing+Ad', 'https://example.com/housing', 'housing'),
  ('all-nyc', 'NYC Jobs Board', 'https://placehold.co/728x90/0891b2/fff?text=Jobs+Ad', 'https://example.com/jobs', 'jobs'),
  ('all-nyc', 'NYC Marketplace', 'https://placehold.co/728x90/2563eb/fff?text=For+Sale+Ad', 'https://example.com/for-sale', 'for-sale'),
  ('all-nyc', 'NYC Services Hub', 'https://placehold.co/728x90/ea580c/fff?text=Services+Ad', 'https://example.com/services', 'services'),
  ('all-nyc', 'NYC Gig Central', 'https://placehold.co/728x90/d97706/fff?text=Gigs+Ad', 'https://example.com/gigs', 'gigs'),
  ('all-nyc', 'NYC Community Board', 'https://placehold.co/728x90/059669/fff?text=Community+Ad', 'https://example.com/community', 'community'),
  ('all-nyc', 'NYC Events', 'https://placehold.co/728x90/6d28d9/fff?text=Tickets+Ad', 'https://example.com/tickets', 'tickets'),
  ('all-nyc', 'NYC Pet Finder', 'https://placehold.co/728x90/65a30d/fff?text=Pets+Ad', 'https://example.com/pets', 'pets'),
  ('all-nyc', 'NYC Connections', 'https://placehold.co/728x90/db2777/fff?text=Personals+Ad', 'https://example.com/personals', 'personals'),
  ('all-nyc', 'NYC Barter Club', 'https://placehold.co/728x90/7c3aed/fff?text=Barter+Ad', 'https://example.com/barter', 'barter'),
  ('all-nyc', 'NYC Rental Hub', 'https://placehold.co/728x90/7c3aed/fff?text=Rentals+Ad', 'https://example.com/rentals', 'rentals'),
  ('all-nyc', 'NYC Resume Bank', 'https://placehold.co/728x90/4b5563/fff?text=Resumes+Ad', 'https://example.com/resumes', 'resumes');

-- Homepage banner
INSERT INTO ads (type, advertiser, image_url, link_url) VALUES
  ('homepage', 'The NYC Classifieds', 'https://placehold.co/600x200/2563eb/fff?text=Free.+Real.+Local.+Verified.', 'https://thenycclassifieds.com');
