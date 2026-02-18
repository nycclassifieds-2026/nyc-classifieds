-- Add new porch post types: seasonal, shoutout
-- Also fixes seasonal templates that were in code but not in DB constraint

ALTER TABLE porch_posts DROP CONSTRAINT IF EXISTS porch_posts_post_type_check;

ALTER TABLE porch_posts ADD CONSTRAINT porch_posts_post_type_check
  CHECK (post_type IN (
    'recommendation','question','alert','lost-and-found','event',
    'stoop-sale','garage-sale','volunteer','carpool','pet-sighting',
    'welcome','group','seasonal','shoutout'
  ));
