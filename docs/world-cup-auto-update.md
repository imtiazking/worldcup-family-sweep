# World Cup Auto-Update

Automated daily sync of `team_status` from API-Football (World Cup 2026).

## Schedule

- **Target:** 02:00 UK time daily
- **Vercel Cron:** `0 1 * * *` (01:00 UTC = 02:00 UK during BST, Jun–Oct)
- During GMT (winter): runs at 01:00 UK — adjust to `0 2 * * *` if needed

## Setup

1. Register at [api-football.com](https://www.api-football.com/) (free tier available)
2. Copy your API key
3. Add to Vercel → **Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `API_FOOTBALL_KEY` | Your API-Football key |
| `CRON_SECRET` | Random secret string |
| `WORLD_CUP_PROVIDER` | `api-football` (optional — auto-enabled when key is set) |

4. Deploy — cron runs automatically

## Manual fallback

Set `WORLD_CUP_PROVIDER=noop` to disable automated API calls. Existing `team_status` rows are never deleted.

If the API fails, the sync aborts and **preserves** current database values.

## Endpoint

```
GET /api/update-world-cup-status
Authorization: Bearer <CRON_SECRET>
```

Vercel Cron sends this header automatically when `CRON_SECRET` is set.

## Data source

- **Provider:** API-Football (`v3.football.api-sports.io`)
- **Competition:** FIFA World Cup — `league=1`, `season=2026`
- **Matches:** Completed only (`status=FT`)
- **Standings:** Group-stage elimination and knockout progression

## What gets updated

Only the `team_status` table:

| Field | Values |
|-------|--------|
| `team_name` | Must match sweep team (Spain, France, etc.) |
| `status` | `active`, `eliminated`, `winner` |
| `stage` | Group Stage → Round of 32 → … → World Cup Winner |

**Not modified:** assignments, participants, invite links, draw logic.

## Manual test

```bash
curl https://your-app.vercel.app/api/update-world-cup-status \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Health check (no auth):

```bash
curl https://your-app.vercel.app/api/update-world-cup-status
```
