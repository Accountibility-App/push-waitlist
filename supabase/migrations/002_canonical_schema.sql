-- Canonical Push Waitlist schema (matches current Supabase DB).
-- Use this if you create the DB from scratch; otherwise 001_initial_schema.sql is the original reference.
-- Supabase SQL: run in SQL Editor.

create extension if not exists citext;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'waitlist_status') then
    create type waitlist_status as enum ('pending', 'confirmed', 'unsubscribed', 'deleted');
  end if;
  if not exists (select 1 from pg_type where typname = 'platform_type') then
    create type platform_type as enum ('web', 'ios', 'android');
  end if;
end
$$;

create table if not exists public.waitlist_users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  platforms platform_type[] not null default '{}'::platform_type[],
  interest text null,
  status waitlist_status not null default 'pending',
  referral_code text not null unique,
  referred_by_user_id uuid null references public.waitlist_users(id) on delete set null,
  referral_count integer not null default 0 check (referral_count >= 0),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz null,
  consent_text_version text not null,
  consent_at timestamptz not null default now(),
  consent_ip_hash text not null,
  consent_user_agent_hash text null
);

create index if not exists idx_waitlist_users_status_created_at on public.waitlist_users (status, created_at);
create index if not exists idx_waitlist_users_referred_by on public.waitlist_users (referred_by_user_id);
create index if not exists idx_waitlist_users_confirmed_at on public.waitlist_users (confirmed_at);

alter table public.waitlist_users drop constraint if exists referral_code_format;
alter table public.waitlist_users add constraint referral_code_format check (referral_code ~ '^[A-Za-z0-9_-]{6,32}$');

alter table public.waitlist_users drop constraint if exists confirmed_at_matches_status;
alter table public.waitlist_users add constraint confirmed_at_matches_status check (
  (status = 'confirmed' and confirmed_at is not null) or (status <> 'confirmed')
);

create table if not exists public.doi_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.waitlist_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz null,
  created_at timestamptz not null default now()
);
create index if not exists idx_doi_tokens_user_id on public.doi_tokens (user_id);
create index if not exists idx_doi_tokens_expires_at on public.doi_tokens (expires_at);

create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.waitlist_users(id) on delete cascade,
  referred_user_id uuid not null references public.waitlist_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint referral_events_unique_pair unique (referrer_user_id, referred_user_id)
);
create index if not exists idx_referral_events_referrer on public.referral_events (referrer_user_id);

alter table public.waitlist_users enable row level security;
alter table public.doi_tokens enable row level security;
alter table public.referral_events enable row level security;

drop policy if exists "deny_all_waitlist_users" on public.waitlist_users;
create policy "deny_all_waitlist_users" on public.waitlist_users as restrictive for all to public using (false) with check (false);
drop policy if exists "deny_all_doi_tokens" on public.doi_tokens;
create policy "deny_all_doi_tokens" on public.doi_tokens as restrictive for all to public using (false) with check (false);
drop policy if exists "deny_all_referral_events" on public.referral_events;
create policy "deny_all_referral_events" on public.referral_events as restrictive for all to public using (false) with check (false);
