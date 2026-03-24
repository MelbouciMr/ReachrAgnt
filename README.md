# REACHR — Autonomous Single-Token Growth Agent

> The agent behind the reach.

## Stack
- **Next.js 15.3.6** + TypeScript
- **Supabase** — database & state
- **Bankr LLM Gateway** — Claude reasoning layer
- **Dexscreener API** — market watcher
- **X API v2** — execution layer
- **GitHub Actions** — low-cost cron scheduler

## Setup

### 1. Clone & install
```bash
git clone <your-repo>
cd reachr
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Supabase
1. Create a new Supabase project
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Copy your project URL and keys to `.env.local`

### 4. GitHub Actions secrets
In your GitHub repo settings → Secrets, add:
- `APP_URL` — your deployed app URL (e.g. `https://reachr.vercel.app`)
- `CRON_SECRET` — same value as in your `.env`

### 5. Run locally
```bash
npm run dev
```

Visit `http://localhost:3000`

## Architecture

### Scheduled jobs
| Job | Frequency | File |
|-----|-----------|------|
| Market check | Every 5 min | `.github/workflows/market-check.yml` |
| Agent decision loop | Every 15 min | `.github/workflows/agent-loop.yml` |

### Key flows
1. **Market check** → reads Dexscreener → saves snapshot → checks milestones
2. **Agent loop** → computes snowball score → calls Claude via Bankr → decides to post or hold → executes on X
3. **Dashboard** → polls `/api/agent/state` every 30s → displays live data

### Snowball score
Score 0–100 based on:
- **Market** (0–40): volume/liquidity ratio + milestone progress + price momentum
- **Social** (0–30): X engagement signal
- **Treasury** (0–20): treasury balance vs target
- **Momentum bonus** (0–10): layers reinforcing each other

### Phases
| Phase | Score | Behavior |
|-------|-------|----------|
| WATCH | 0–24 | Observe only |
| BUILD | 25–49 | Selective posting |
| IGNITE | 50–74 | Active posting when signal hits 65+ |
| ESCALATE | 75–100 | Aggressive momentum posting |

## Milestones
10K → 25K → 50K → **100K** (first promo checkpoint) → 250K → 500K → 1M

## Notes
- Dexscreener promotion is **manual approval only** — Reachr recommends, operator decides
- X OAuth 1.0a signing: install `oauth-1.0a` package for production-grade signing
- The agent never posts without a signal justification
