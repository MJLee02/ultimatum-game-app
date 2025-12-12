-- Migration script to update database schema for multiplayer version
-- Run this in your Supabase SQL Editor

-- Step 1: Drop existing tables to start fresh
DROP TABLE IF EXISTS demographics CASCADE;
DROP TABLE IF EXISTS rounds CASCADE;
DROP TABLE IF EXISTS player_roles CASCADE;
DROP TABLE IF EXISTS game_players CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Step 2: Create sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create games table (new structure without player1_id/player2_id)
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_round INTEGER DEFAULT 1,
  started_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create game_players table (NEW)
CREATE TABLE game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- Step 5: Create player_roles table (NEW)
CREATE TABLE player_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  role TEXT NOT NULL,
  matched_with TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id, round_number)
);

-- Step 6: Create rounds table (updated structure)
CREATE TABLE rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  proposer_id TEXT NOT NULL,
  responder_id TEXT NOT NULL,
  proposal_amount DECIMAL(10, 2),
  responder_decision BOOLEAN,
  proposer_payout DECIMAL(10, 2) DEFAULT 0,
  responder_payout DECIMAL(10, 2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, round_number, proposer_id, responder_id)
);

-- Step 7: Create demographics table
CREATE TABLE demographics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  date_of_birth TEXT,
  birth_country TEXT,
  current_country TEXT,
  years_in_us INTEGER,
  generation_status TEXT,
  age_arrived_us INTEGER,
  countries_lived JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create indexes
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_game_players_player_id ON game_players(player_id);
CREATE INDEX idx_player_roles_game_round ON player_roles(game_id, round_number);
CREATE INDEX idx_player_roles_player ON player_roles(game_id, player_id);
CREATE INDEX idx_rounds_game_id ON rounds(game_id);
CREATE INDEX idx_rounds_round_number ON rounds(round_number);
CREATE INDEX idx_rounds_proposer ON rounds(proposer_id);
CREATE INDEX idx_rounds_responder ON rounds(responder_id);
CREATE INDEX idx_demographics_player_id ON demographics(player_id);
CREATE INDEX idx_demographics_game_id ON demographics(game_id);

-- Step 9: Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographics ENABLE ROW LEVEL SECURITY;

-- Step 10: Create policies
CREATE POLICY "Allow all operations on sessions" ON sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on games" ON games
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on game_players" ON game_players
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on player_roles" ON player_roles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on rounds" ON rounds
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on demographics" ON demographics
  FOR ALL USING (true) WITH CHECK (true);

