-- =====================================================================
-- Apply-all migration bundle.
-- Safe to re-run: every statement uses IF NOT EXISTS / IF EXISTS guards.
-- Paste the whole file into the Supabase SQL editor and Run.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- M3 · Posts, Comments, Deals
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read posts" ON posts;
CREATE POLICY "Public can read posts"
  ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT WITH CHECK (true);


CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_restaurant ON comments (restaurant_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read comments" ON comments;
CREATE POLICY "Public can read comments"
  ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT WITH CHECK (true);


CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  original_price NUMERIC(5,2),
  deal_price NUMERIC(5,2) NOT NULL CHECK (deal_price > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_active ON deals (is_active, expires_at);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active deals" ON deals;
CREATE POLICY "Public can read active deals"
  ON deals FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access on deals" ON deals;
CREATE POLICY "Service role full access on deals"
  ON deals FOR ALL USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────
-- M4 · Vote counts on restaurants (for the up/down ratio bar)
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS up_count   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS down_count INTEGER NOT NULL DEFAULT 0;

UPDATE restaurants
SET
  up_count   = GREATEST(vote_score, 0),
  down_count = GREATEST(-vote_score, 0)
WHERE up_count = 0 AND down_count = 0;


-- ─────────────────────────────────────────────────────────────────────
-- M5 · Posts can mention a restaurant (link from feed → restaurant)
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS restaurant_id UUID
    REFERENCES restaurants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_restaurant ON posts (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
