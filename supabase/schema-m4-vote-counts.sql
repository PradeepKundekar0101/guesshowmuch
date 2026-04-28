-- M4: Track upvotes and downvotes separately so we can show a vote ratio.
-- Run this in the Supabase SQL editor.

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS up_count   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS down_count INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows from the running net score:
--   positive vote_score → that many upvotes
--   negative vote_score → that many downvotes
UPDATE restaurants
SET
  up_count   = GREATEST(vote_score, 0),
  down_count = GREATEST(-vote_score, 0)
WHERE up_count = 0 AND down_count = 0;
