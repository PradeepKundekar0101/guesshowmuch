-- Community voting on deals (m5)
-- Adds vote score + up/down counts to the deals table.

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS vote_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS up_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS down_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_deals_vote_score ON deals (vote_score DESC);
