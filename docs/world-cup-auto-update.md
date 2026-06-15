# World Cup Auto-Update Architecture

Automated daily sync of `team_status` from an external FIFA/tournament data provider.

## Schedule

- **Target:** 02:00 UK time daily
- **Vercel Cron:** `0 2 * * *` (02:00 UTC — aligns with UK GMT; during BST, runs at 03:00 UK)

Configured in `vercel.json`.

## Endpoint

```
POST /api/update-world-cup-status
Authorization: Bearer <CRON_SECRET>
```

`GET` returns endpoint metadata for health checks.

## Flow

```
Vercel Cron (daily)
    → POST /api/update-world-cup-status
    → createWorldCupProvider()
    → provider.fetchTournamentSnapshot()
    → applyTournamentSnapshot()
    → upsert team_status rows in Supabase
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CRON_SECRET` | Yes (prod) | Secures the cron endpoint |
| `WORLD_CUP_PROVIDER` | No | `noop` (default), `api-football`, or `custom` |
| `API_FOOTBALL_KEY` | Future | API key when `api-football` provider is implemented |

## Adding a Real Provider

1. Create `src/lib/world-cup-provider/api-football-provider.ts`
2. Implement `WorldCupDataProvider` interface
3. Map API responses to `ProviderTeamUpdate[]`
4. Register in `src/lib/world-cup-provider/index.ts`
5. Set `WORLD_CUP_PROVIDER=api-football` in Vercel

## team_status Schema

Each update sets:

- `team_name` — must match `teams.name` in the sweep
- `status` — `active` | `eliminated` | `winner`
- `stage` — e.g. `Group Stage`, `Round of 16`, `Semi Final`, `Final`

## Manual Test

```bash
curl -X POST https://your-app.vercel.app/api/update-world-cup-status \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

With `noop` provider, response confirms architecture without modifying data.
