-- =====================================================================
--  Football Genius — Supabase Player Data Schema
--  Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =====================================================================

-- ─── Table 1: global_players (Higher/Lower game) ────────────────────
CREATE TABLE IF NOT EXISTS global_players (
  id TEXT PRIMARY KEY,                    -- e.g. "messi"
  name TEXT NOT NULL,
  image TEXT NOT NULL,                    -- relative path e.g. "img/players/messi.jpg"
  career_goals INTEGER DEFAULT 0,
  career_trophies INTEGER DEFAULT 0,
  market_value NUMERIC DEFAULT 0,        -- USD millions
  transfer_from TEXT,
  transfer_to TEXT,
  transfer_fee NUMERIC DEFAULT 0,        -- USD millions
  transfermarkt_id INTEGER,              -- for automated scraping
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Table 2: guess_players (Guess Who game) ────────────────────────
CREATE TABLE IF NOT EXISTS guess_players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  image TEXT NOT NULL,
  club TEXT NOT NULL,
  nation TEXT NOT NULL,
  transfermarkt_id INTEGER,              -- for automated scraping
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Table 3: grid_players (Grid Challenge game) ────────────────────
CREATE TABLE IF NOT EXISTS grid_players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  clubs TEXT[] NOT NULL DEFAULT '{}',     -- PostgreSQL text array
  nation TEXT NOT NULL,
  stats TEXT[] NOT NULL DEFAULT '{}',     -- PostgreSQL array of stat IDs
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Row Level Security ─────────────────────────────────────────────
ALTER TABLE global_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE guess_players  ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_players   ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone with the anon key can SELECT)
CREATE POLICY "Public read global_players" ON global_players FOR SELECT USING (true);
CREATE POLICY "Public read guess_players"  ON guess_players  FOR SELECT USING (true);
CREATE POLICY "Public read grid_players"   ON grid_players   FOR SELECT USING (true);

-- Service role can do everything (used by the automated updater)
-- (Service role bypasses RLS by default, but explicit policies for clarity)
CREATE POLICY "Service write global_players" ON global_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write guess_players"  ON guess_players  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write grid_players"   ON grid_players   FOR ALL USING (true) WITH CHECK (true);

-- ─── Indexes for performance ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_guess_players_name ON guess_players(name);
CREATE INDEX IF NOT EXISTS idx_grid_players_name  ON grid_players(name);
