-- Posts table (community feed)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read posts"
  ON posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT WITH CHECK (true);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_restaurant ON comments (restaurant_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read comments"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT WITH CHECK (true);

-- Deals table (hot deals)
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

CREATE POLICY "Public can read active deals"
  ON deals FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access on deals"
  ON deals FOR ALL USING (true) WITH CHECK (true);
