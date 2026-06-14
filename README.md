# World Cup Family Sweep 2026

A private family sweep draw app for FIFA World Cup 2026. Each participant gets a unique invite link to spin a slot machine and claim one of 11 teams — once only, forever locked.

## Stack

- **Next.js 15** (App Router)
- **Supabase** (Postgres + RLS)
- **Tailwind CSS 4**
- **Framer Motion** (animations)
- **Vercel** (deployment)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Copy `.env.example` to `.env.local` and fill in your keys

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

1. Push to GitHub and import in Vercel
2. Add environment variables from `.env.example`
3. Set `NEXT_PUBLIC_APP_URL` to your production URL

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with progress |
| `/sweep/[token]` | Private draw page (one per participant) |
| `/results` | Public results board |
| `/invites?key=ADMIN_SECRET_KEY` | Admin page with all invite links |

## Participants & Invite Tokens

| Name | Token | Path |
|------|-------|------|
| Dado | `dado-k9m2p7x4` | `/sweep/dado-k9m2p7x4` |
| Babaji | `babaji-h3n8q1w6` | `/sweep/babaji-h3n8q1w6` |
| Nasir | `nasir-r5t0y4z8` | `/sweep/nasir-r5t0y4z8` |
| Noman | `noman-j2c6v9b3` | `/sweep/noman-j2c6v9b3` |
| Imi | `imi-f8g1l5s0` | `/sweep/imi-f8g1l5s0` |
| Nazia | `nazia-a4d7e2h9` | `/sweep/nazia-a4d7e2h9` |
| Shazia | `shazia-u6i0o3p7` | `/sweep/shazia-u6i0o3p7` |
| Nabeel | `nabeel-m1n4q8t2` | `/sweep/nabeel-m1n4q8t2` |
| Zach | `zach-w5x9y3z6` | `/sweep/zach-w5x9y3z6` |
| Isaac | `isaac-b7c0d4f8` | `/sweep/isaac-b7c0d4f8` |
| Zahra | `zahra-g2h6j0k4` | `/sweep/zahra-g2h6j0k4` |

## Teams

Spain, France, Germany, Argentina, England, Portugal, Brazil, Netherlands, Morocco, Belgium, Mexico
