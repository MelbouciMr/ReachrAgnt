-- Reachr Database Schema
-- Run this in your Supabase SQL editor

-- Agent state (singleton row)
create table if not exists agent_state (
  id text primary key default 'singleton',
  mode text not null default 'WATCH',
  status text not null default 'active',
  market_cap numeric default 0,
  liquidity numeric default 0,
  volume_h24 numeric default 0,
  price_usd numeric default 0,
  price_change_1h numeric default 0,
  price_change_24h numeric default 0,
  formatted_cap text default '$0',
  snowball_score integer default 0,
  social_engagement numeric default 0,
  treasury_balance numeric default 0,
  last_market_check timestamptz,
  last_decision timestamptz,
  cooldown_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Market snapshots
create table if not exists market_snapshots (
  id uuid primary key default gen_random_uuid(),
  market_cap numeric not null,
  liquidity_usd numeric not null,
  volume_h24 numeric not null,
  price_usd numeric not null,
  captured_at timestamptz not null default now()
);

create index if not exists market_snapshots_captured_at_idx on market_snapshots (captured_at desc);

-- Social posts
create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  tweet_id text unique,
  content text not null,
  posted_at timestamptz not null default now(),
  status text not null default 'published',
  engagement jsonb default '{}'
);

-- LLM decisions
create table if not exists llm_decisions (
  id uuid primary key default gen_random_uuid(),
  should_post boolean not null,
  post_content text,
  reasoning text,
  confidence integer,
  mode text,
  snowball_score integer,
  executed boolean default false,
  executed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists llm_decisions_created_at_idx on llm_decisions (created_at desc);

-- Milestones
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  milestone numeric not null unique,
  confirmed_at timestamptz not null default now(),
  market_cap_at_confirmation numeric not null,
  liquidity_at_confirmation numeric not null,
  volume_at_confirmation numeric not null,
  announced boolean default false
);

-- Promotion recommendations
create table if not exists promotion_recommendations (
  id uuid primary key default gen_random_uuid(),
  recommended_at timestamptz not null default now(),
  reason text not null,
  snowball_score integer not null,
  market_cap numeric not null,
  status text not null default 'pending_approval',
  approved_at timestamptz,
  rejected_at timestamptz
);

-- Snowball state (singleton row)
create table if not exists snowball_state (
  id text primary key default 'singleton',
  score integer not null default 0,
  phase text not null default 'WATCH',
  delta integer default 0,
  breakdown jsonb default '{"market":0,"social":0,"treasury":0,"momentum":0}',
  updated_at timestamptz default now()
);

-- Snowball events
create table if not exists snowball_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  weight numeric not null,
  description text,
  score_before integer,
  score_after integer,
  created_at timestamptz default now()
);

-- Insert initial agent state
insert into agent_state (id) values ('singleton')
on conflict (id) do nothing;

insert into snowball_state (id) values ('singleton')
on conflict (id) do nothing;
