-- Optional progression probability per team (0–100)
-- Safe to run on existing projects

ALTER TABLE team_status
ADD COLUMN IF NOT EXISTS next_stage_probability NUMERIC;

COMMENT ON COLUMN team_status.next_stage_probability IS
  'Estimated chance (0-100) of reaching the next tournament stage. NULL until provider supplies data.';
