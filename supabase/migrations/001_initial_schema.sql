-- World Cup Family Sweep 2026 — initial schema

CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  invite_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  flag_emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL UNIQUE REFERENCES participants(id) ON DELETE CASCADE,
  team_id UUID NOT NULL UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
  drawn_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_invite_token ON participants(invite_token);
CREATE INDEX IF NOT EXISTS idx_assignments_participant ON assignments(participant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_team ON assignments(team_id);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read participants" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Public read teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Public read assignments" ON assignments
  FOR SELECT USING (true);

-- Seed teams
INSERT INTO teams (name, flag_emoji) VALUES
  ('Spain', '🇪🇸'),
  ('France', '🇫🇷'),
  ('Germany', '🇩🇪'),
  ('Argentina', '🇦🇷'),
  ('England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
  ('Portugal', '🇵🇹'),
  ('Brazil', '🇧🇷'),
  ('Netherlands', '🇳🇱'),
  ('Morocco', '🇲🇦'),
  ('Belgium', '🇧🇪'),
  ('Mexico', '🇲🇽')
ON CONFLICT (name) DO NOTHING;

-- Seed participants with private invite tokens
INSERT INTO participants (name, invite_token) VALUES
  ('Dado', 'dado-k9m2p7x4'),
  ('Babaji', 'babaji-h3n8q1w6'),
  ('Nasir', 'nasir-r5t0y4z8'),
  ('Noman', 'noman-j2c6v9b3'),
  ('Imi', 'imi-f8g1l5s0'),
  ('Nazia', 'nazia-a4d7e2h9'),
  ('Shazia', 'shazia-u6i0o3p7'),
  ('Nabeel', 'nabeel-m1n4q8t2'),
  ('Zach', 'zach-w5x9y3z6'),
  ('Isaac', 'isaac-b7c0d4f8'),
  ('Zahra', 'zahra-g2h6j0k4')
ON CONFLICT (name) DO NOTHING;

-- Atomic draw function (prevents race conditions)
CREATE OR REPLACE FUNCTION draw_team(p_invite_token TEXT)
RETURNS TABLE (
  participant_name TEXT,
  team_name TEXT,
  team_flag TEXT,
  already_drawn BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant_id UUID;
  v_existing_team_id UUID;
  v_team_id UUID;
  v_team_name TEXT;
  v_team_flag TEXT;
  v_participant_name TEXT;
BEGIN
  SELECT p.id, p.name INTO v_participant_id, v_participant_name
  FROM participants p
  WHERE p.invite_token = p_invite_token;

  IF v_participant_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite token';
  END IF;

  SELECT a.team_id INTO v_existing_team_id
  FROM assignments a
  WHERE a.participant_id = v_participant_id;

  IF v_existing_team_id IS NOT NULL THEN
    SELECT t.name, t.flag_emoji INTO v_team_name, v_team_flag
    FROM teams t
    WHERE t.id = v_existing_team_id;

    RETURN QUERY SELECT v_participant_name, v_team_name, v_team_flag, true;
    RETURN;
  END IF;

  SELECT t.id, t.name, t.flag_emoji
  INTO v_team_id, v_team_name, v_team_flag
  FROM teams t
  WHERE t.id NOT IN (SELECT team_id FROM assignments)
  ORDER BY random()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'No teams remaining';
  END IF;

  INSERT INTO assignments (participant_id, team_id)
  VALUES (v_participant_id, v_team_id);

  RETURN QUERY SELECT v_participant_name, v_team_name, v_team_flag, false;
END;
$$;

REVOKE ALL ON FUNCTION draw_team(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION draw_team(TEXT) TO service_role;
