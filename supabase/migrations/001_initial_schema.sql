-- Push Waitlist: Initial schema (DSGVO-oriented)
-- Run in Supabase SQL Editor or via Supabase CLI

-- Enum for user status
CREATE TYPE waitlist_status AS ENUM (
  'pending',
  'confirmed',
  'unsubscribed',
  'deleted'
);

-- Platform enum for multi-select
CREATE TYPE waitlist_platform AS ENUM ('web', 'ios', 'android');

-- Main waitlist table
CREATE TABLE waitlist_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  platforms waitlist_platform[] DEFAULT '{}',
  interest TEXT,
  status waitlist_status NOT NULL DEFAULT 'pending',
  referral_code TEXT NOT NULL UNIQUE,
  referred_by_user_id UUID REFERENCES waitlist_users(id),
  referral_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  consent_text_version TEXT NOT NULL,
  consent_at TIMESTAMPTZ NOT NULL,
  consent_ip_hash TEXT,
  consent_user_agent_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DOI tokens (hashed, never store raw)
CREATE TABLE doi_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES waitlist_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referral events (auditing)
CREATE TABLE referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES waitlist_users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES waitlist_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_user_id, referred_user_id)
);

-- Indexes
CREATE INDEX idx_waitlist_users_email ON waitlist_users(email);
CREATE INDEX idx_waitlist_users_status ON waitlist_users(status);
CREATE INDEX idx_waitlist_users_referral_code ON waitlist_users(referral_code);
CREATE INDEX idx_waitlist_users_referred_by ON waitlist_users(referred_by_user_id);
CREATE INDEX idx_waitlist_users_confirmed_rank ON waitlist_users(confirmed_at) WHERE confirmed_at IS NOT NULL;
CREATE INDEX idx_doi_tokens_token_hash ON doi_tokens(token_hash);
CREATE INDEX idx_doi_tokens_expires_at ON doi_tokens(expires_at) WHERE used_at IS NULL;

-- RLS: no direct client access; all writes via service role / server
ALTER TABLE waitlist_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doi_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

-- Deny all for anon/authenticated; only service_role can access
CREATE POLICY "Service role only waitlist_users" ON waitlist_users
  FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "Service role only doi_tokens" ON doi_tokens
  FOR ALL USING (false) WITH CHECK (false);

CREATE POLICY "Service role only referral_events" ON referral_events
  FOR ALL USING (false) WITH CHECK (false);

-- Function: update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER waitlist_users_updated_at
  BEFORE UPDATE ON waitlist_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
