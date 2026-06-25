# World Cup Tracker Auto-Update

Automatic sync of `team_status` from the verified FIFA/Wikipedia snapshot used by the family sweep tracker.

## Schedule

- **Vercel Cron:** `0 */6 * * *` (every 6 hours)
- **Endpoint:** `GET /api/sync-team-status`
- **Auth:** `Authorization: Bearer <CRON_SECRET>` (Vercel Cron) or `?key=<CRON_SECRET>` (manual)

## Required environment variables (Vercel Production)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tracker reads (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron writes `team_status` + `tournament_meta` |
| `CRON_SECRET` | Protects sync endpoint |

`API_FOOTBALL_KEY` is **optional** and used only by the legacy `/api/update-world-cup-status` route (not the active cron).

## Data source

The active cron applies `src/lib/world-cup-verified-snapshot.ts` — manually verified FIFA "(A)" qualification rules from Wikipedia group pages.

To mark newly qualified teams, update that snapshot file and deploy. The 6-hour cron then re-applies it automatically.

## Manual sync

```bash
npm run sync:team-status
```

Or trigger production:

```bash
curl "https://worldcup-family-sweep.vercel.app/api/sync-team-status?key=YOUR_CRON_SECRET"
```

Health check (no auth):

```bash
curl https://worldcup-family-sweep.vercel.app/api/sync-team-status
```

## Response shape

```json
{
  "ok": true,
  "qualified": 6,
  "pending": 9,
  "eliminated": 0,
  "updatedTeams": ["Mexico", "..."],
  "updated": 15,
  "skipped": 0,
  "lastSyncAt": "2026-06-24T12:00:00.000Z",
  "dataSource": "Wikipedia 2026 FIFA World Cup group pages ...",
  "message": "Synced 15 team(s) from verified snapshot ..."
}
```

## Tracker UI

`/tracker` reads `tournament_meta.last_status_sync` for:

- Last updated
- Data source
- Sync status (up to date / failed)
- Last checked (on failure — tracker still loads)

## Legacy API-Football route

`/api/update-world-cup-status` remains available for future live API sync when `API_FOOTBALL_KEY` is configured. It is no longer on the Vercel cron schedule.
