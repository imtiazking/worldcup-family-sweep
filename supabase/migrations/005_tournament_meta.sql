-- Tournament sync metadata (public read for tracker timestamp)

CREATE TABLE IF NOT EXISTS tournament_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tournament_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tournament_meta" ON tournament_meta;
CREATE POLICY "Public read tournament_meta"
  ON tournament_meta FOR SELECT
  USING (true);

COMMENT ON TABLE tournament_meta IS
  'Key/value store for tracker metadata such as last_status_sync.';
