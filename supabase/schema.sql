CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cuisine_type TEXT,
  address TEXT,
  suburb TEXT,
  city TEXT NOT NULL DEFAULT 'Brisbane',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  dish_name TEXT NOT NULL,
  price NUMERIC(5,2) NOT NULL CHECK (price > 0 AND price <= 15),
  photo_url TEXT,
  pin_type TEXT NOT NULL DEFAULT 'standard' CHECK (pin_type IN ('standard', 'featured', 'hot_deal', 'top_rated')),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  flag_count INTEGER NOT NULL DEFAULT 0,
  vote_score INTEGER NOT NULL DEFAULT 0,
  up_count INTEGER NOT NULL DEFAULT 0,
  down_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_restaurants_price ON restaurants (price);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants (city);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants (is_active) WHERE is_active = true;

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active restaurants"
  ON restaurants
  FOR SELECT
  USING (is_active = true AND flag_count < 3);

CREATE POLICY "Service role full access"
  ON restaurants
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
