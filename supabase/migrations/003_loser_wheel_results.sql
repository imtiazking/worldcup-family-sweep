-- Loser's Wheel results — one spin per eliminated participant

CREATE TABLE IF NOT EXISTS loser_wheel_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  prize TEXT NOT NULL,
  spun_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loser_wheel_team ON loser_wheel_results(team_id);
CREATE INDEX IF NOT EXISTS idx_loser_wheel_spun_at ON loser_wheel_results(spun_at DESC);

ALTER TABLE loser_wheel_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read loser wheel results" ON loser_wheel_results
  FOR SELECT USING (true);
