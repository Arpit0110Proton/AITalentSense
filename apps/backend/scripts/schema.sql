-- AI Talent Sense schema v1.0
create extension if not exists pgcrypto;

-- 750 synthetic candidates, JSONB mirrors CrustData Person Search profile shape
create table if not exists mock_profiles (
  id uuid primary key default gen_random_uuid(),
  profile jsonb not null,
  role_family text not null,
  seniority text not null,
  city text not null,
  country text not null,
  skills text[] not null,
  years_of_experience int not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_mock_skills on mock_profiles using gin (skills);
create index if not exists idx_mock_role_seniority on mock_profiles (role_family, seniority);
create index if not exists idx_mock_city on mock_profiles (city);

-- cache of real CrustData responses (only used in live mode), 24h TTL enforced in code
create table if not exists live_profiles_cache (
  query_hash text primary key,          -- sha256 of canonicalized FilterSet JSON
  filters jsonb not null,
  profiles jsonb not null,
  total_count int,
  fetched_at timestamptz not null default now()
);

-- one GLOBAL history (no auth, visible to every visitor — deliberate)
create table if not exists search_history (
  id uuid primary key default gen_random_uuid(),
  jd_text text not null,
  filters jsonb not null,
  mode text not null check (mode in ('mock','live')),
  results jsonb not null default '[]'::jsonb,  -- CandidateProfile[] with scores merged in
  candidate_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_history_created on search_history (created_at desc);

-- named shortlists, shareable by URL, still no auth
create table if not exists shortlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  search_id uuid references search_history(id) on delete set null,
  candidates jsonb not null,            -- frozen snapshot of the selected scored candidates
  created_at timestamptz not null default now()
);

-- RLS: enable on all tables, create NO public policies.
-- The backend uses the service-role key which bypasses RLS; the anon key can read nothing.
alter table mock_profiles enable row level security;
alter table live_profiles_cache enable row level security;
alter table search_history enable row level security;
alter table shortlists enable row level security;
