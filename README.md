# REACHR

> The agent behind the reach.

Reachr is an autonomous single-token growth agent. It monitors its own token pair, computes a momentum score across market, social, and treasury signals, and deploys attention on X — only when conditions justify it.

**Signal-driven. Not schedule-driven.**

![Status](https://img.shields.io/badge/status-live-4ade80?style=flat-square&labelColor=0e0e0e)
![Chain](https://img.shields.io/badge/chain-Base-0052ff?style=flat-square&labelColor=0e0e0e)
![Stack](https://img.shields.io/badge/stack-Next.js_15-black?style=flat-square&labelColor=0e0e0e)
![LLM](https://img.shields.io/badge/LLM-Claude_via_Bankr-cc785c?style=flat-square&labelColor=0e0e0e)

---

## What it does

- 📡 **Monitors** your token pair on Dexscreener every 5 minutes — market cap, volume, liquidity
- 🧠 **Computes** a Snowball Score (0–100) from market, social, and treasury signals
- 🤖 **Asks Claude** via the Bankr LLM Gateway: post or hold?
- 🐦 **Posts on X** only when momentum justifies it — never spam
- 🏁 **Detects milestones** (10K → 25K → 50K → 100K → 250K → 500K → 1M MC) and announces them
- 💡 **Recommends Dexscreener boosts** flagged for manual operator approval

---

## Architecture

```
GitHub Actions (cron)
  ├── every 5 min  → POST /api/market   (Dexscreener read + milestone check)
  └── every 15 min → POST /api/agent    (Snowball score + Claude decision + X post)

Next.js App (Render / Vercel)
  ├── / (landing)
  ├── /dashboard
  └── /api/
      ├── market/        ← market check
      ├── agent/         ← decision loop
      └── agent/state/   ← dashboard polling

Supabase
  ├── agent_state
  ├── market_snapshots
  ├── snowball_state
  ├── snowball_events
  ├── llm_decisions
  ├── social_posts
  ├── milestones
  └── promotion_recommendations
```

---

## Snowball Score

The Snowball Score (0–100) compounds momentum across three layers. When layers reinforce each other, the agent becomes more willing to act.

| Layer    | Max | Signal |
|----------|-----|--------|
| Market   | 40  | Volume/liquidity ratio + milestone progress + price momentum |
| Social   | 30  | X engagement score |
| Treasury | 20  | Treasury balance vs target |
| Momentum | 10  | Bonus when 2+ layers align |

| Phase     | Score  | Behavior |
|-----------|--------|----------|
| WATCH     | 0–24   | Observe only |
| BUILD     | 25–49  | Selective posting |
| IGNITE    | 50–74  | Post when score ≥ 65 |
| ESCALATE  | 75–100 | Aggressive momentum posting |

---

## Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 15.3.6 + TypeScript |
| LLM | Claude via Bankr LLM Gateway |
| Wallet | Bankr Agent API |
| Market data | Dexscreener API (no key required) |
| Social | X API v2 |
| Database | Supabase |
| Scheduler | GitHub Actions |
| Hosting | Render / Vercel |

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/your-user/reachr
cd reachr
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your_random_secret

# Bankr
BANKR_API_KEY=your_bankr_api_key
BANKR_LLM_KEY=your_bankr_llm_key
BANKR_WALLET_ADDRESS=your_wallet_address

# X / Twitter
X_CLIENT_ID=your_consumer_key
X_CLIENT_SECRET=your_consumer_secret
X_BEARER_TOKEN=your_bearer_token
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Token (find pair address on dexscreener.com)
AGENT_TOKEN_ADDRESS=0x...
AGENT_PAIR_ADDRESS=0x...
TOKEN_NAME=Reachr
TOKEN_TICKER=RCHR
CHAIN_ID=8453
```

### 3. Supabase

Run the migration in your Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
```

### 4. GitHub Actions secrets

In your GitHub repo → Settings → Secrets → Actions, add:

| Secret | Value |
|--------|-------|
| `APP_URL` | Your deployed URL (e.g. `https://reachragnt.onrender.com`) |
| `CRON_SECRET` | Same value as `CRON_SECRET` in your `.env` |

This enables:
- `market-check.yml` → runs every 5 minutes
- `agent-loop.yml` → runs every 15 minutes

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## API Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/market` | Market check — reads Dexscreener, saves snapshot, checks milestones | `x-cron-secret` |
| `POST` | `/api/agent` | Decision loop — computes Snowball Score, calls Claude, posts on X | `x-cron-secret` |
| `GET` | `/api/agent/state` | Returns current agent state for dashboard | public |

---

## Milestones

```
10K → 25K → 50K → 100K* → 250K → 500K → 1M
                    ↑
             First promo checkpoint
             (manual approval required)
```

Milestones are confirmed across repeated reads and cross-verified against liquidity before announcement. No false signals.

---

## Agent Prompt

```
You are Reachr, an autonomous single-token growth agent.

Your role is to monitor your token's market behavior, detect momentum,
and decide when attention should be deployed on X.

Do not post for the sake of activity.
Do not imitate generic shill bots.
Do not force excitement when the signal is weak.

Your objective is to compound momentum.
When market behavior, social engagement, and treasury conditions begin
reinforcing each other, strengthen the loop with precise, high-leverage posting.

When the signal is weak, stay selective.
When a milestone is confirmed, announce it clearly.
When promotion conditions are met, recommend the move but mark it as
manual approval required.

You are signal-driven, not schedule-driven.
```

---

## Project Structure

```
reachr/
├── .github/workflows/
│   ├── market-check.yml       # every 5 min
│   └── agent-loop.yml         # every 15 min
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── api/
│   │       ├── market/
│   │       └── agent/
│   ├── components/
│   │   ├── landing/
│   │   └── dashboard/
│   └── lib/
│       ├── bankr/
│       ├── dexscreener/
│       ├── engine/
│       ├── supabase/
│       └── x/
├── supabase/migrations/
│   └── 001_initial_schema.sql
├── .env.example
└── README.md
```

---

## Notes

- Dexscreener promotion is **manual approval only** — Reachr recommends, operator decides
- X OAuth 1.0a: install `oauth-1.0a` package for production-grade request signing
- On Render free tier: add a keepalive ping workflow to prevent cold starts
- The agent never posts without a signal justification from Claude

---

Built with [Bankr](https://bankr.bot) · Powered by [Claude](https://anthropic.com) · Data by [Dexscreener](https://dexscreener.com)
