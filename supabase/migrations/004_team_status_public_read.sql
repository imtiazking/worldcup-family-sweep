-- team_status must be publicly readable for the tracker (anon client).
-- Without this policy, team_status queries return [] and every team stays "active".

ALTER TABLE team_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read team_status" ON team_status;

CREATE POLICY "Public read team_status" ON team_status
  FOR SELECT USING (true);
