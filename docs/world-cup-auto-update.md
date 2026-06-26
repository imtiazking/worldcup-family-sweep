# World Cup Tracker Auto-Update

Automatic sync of `team_status` using **API-Football live-first** mode, with fallback to the verified FIFA/Wikipedia snapshot.

## Schedule

- **Vercel Cron:** `0 6 * * *` (daily at 06:00 UTC)
- **Note:** Vercel Hobby allows **one cron run per day** only.
- **Endpoint:** `GET /api/sync-team-status`
- **Auth:** `Authorization: Bearer <CRON_SECRET>` (Vercel Cron) or `?key=<CRON_SECRET>` (manual)

## Required environment variables (Vercel Production)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tracker reads (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron writes `team_status` + `tournament_meta` |
| `CRON_SECRET` | Protects sync endpoint |
| `API_FOOTBALL_KEY` | Live standings/fixtures/rounds/teams from API-Football |

## Live-first flow

1. Cron calls `/api/sync-team-status`.
2. Fetches API-Football (league `1`, season `2026`):
   - `/standings`
   - `/fixtures`
   - `/fixtures/rounds`
   - `/teams`
3. If standings + rounds are valid → updates `team_status` from live API.
4. On API failure, rate limit, or invalid/ambiguous dataset → applies `world-cup-verified-snapshot.ts`.

### `tournament_meta.source` values

| Source key | Tracker label |
|------------|---------------|
| `api-football-live` | API-Football Live |
| `verified-snapshot-fallback` | Verified snapshot (API fallback) |
| `api-football-error` | Verified snapshot (API error) |

Safety logs (counts, mapped/unmapped teams, ambiguous teams) are written to `tournament_meta.last_status_sync` under `logs`.

## Manual sync

```bash
npm run probe:api-football   # test API key + endpoints
npm run sync:team-status     # live-first sync to Supabase
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
  "dataSource": "API-Football Live",
  "source": "api-football-live",
  "message": "Synced 15 team(s) from API-Football Live ...",
  "logs": { "standingsGroups": 12, "mappedSweepTeams": ["..."], "...": "..." }
}
```

## Tracker UI

`/tracker` reads `tournament_meta.last_status_sync` for:

- Last updated
- Data source (e.g. **API-Football Live**)
- Sync status (up to date / failed)

## Legacy route

`/api/update-world-cup-status` remains for the older provider-only sync path. The active cron uses `/api/sync-team-status`.

## Updating the fallback snapshot

When API-Football is unavailable, edit `src/lib/world-cup-verified-snapshot.ts` and deploy. The snapshot is **not removed** — it is the safety net.
