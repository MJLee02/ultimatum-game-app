-- Supabase Database Schema for Ultimatum Game App (Multiplayer Version)
-- Run this SQL in your Supabase SQL Editor

-- Sessions table to track player sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table to track game sessions (multiplayer lobbies)
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'completed'
  current_round INTEGER DEFAULT 1,
  started_by TEXT, -- player_id who started the game
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game players table to track all players in a game
CREATE TABLE IF NOT EXISTS game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- Player roles table to store which role each player has in each round
CREATE TABLE IF NOT EXISTS player_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  role TEXT NOT NULL, -- 'proposer' or 'responder'
  matched_with TEXT, -- player_id of their matched partner
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id, round_number)
);

-- Rounds table to track individual round data (proposals and responses)
CREATE TABLE IF NOT EXISTS rounds (
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

-- Demographics table to store player demographic information
CREATE TABLE IF NOT EXISTS demographics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT,
  education TEXT,
  income TEXT,
  ethnicity TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_player_id ON game_players(player_id);
CREATE INDEX IF NOT EXISTS idx_player_roles_game_round ON player_roles(game_id, round_number);
CREATE INDEX IF NOT EXISTS idx_player_roles_player ON player_roles(game_id, player_id);
CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_rounds_round_number ON rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_rounds_proposer ON rounds(proposer_id);
CREATE INDEX IF NOT EXISTS idx_rounds_responder ON rounds(responder_id);
CREATE INDEX IF NOT EXISTS idx_demographics_player_id ON demographics(player_id);
CREATE INDEX IF NOT EXISTS idx_demographics_game_id ON demographics(game_id);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow all operations on games" ON games;
DROP POLICY IF EXISTS "Allow all operations on game_players" ON game_players;
DROP POLICY IF EXISTS "Allow all operations on player_roles" ON player_roles;
DROP POLICY IF EXISTS "Allow all operations on rounds" ON rounds;
DROP POLICY IF EXISTS "Allow all operations on demographics" ON demographics;

-- Create policies to allow all operations (adjust based on your security needs)
-- For development, you might want to allow all operations
-- For production, you should create more restrictive policies

-- Sessions policies
CREATE POLICY "Allow all operations on sessions" ON sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Games policies
CREATE POLICY "Allow all operations on games" ON games
  FOR ALL USING (true) WITH CHECK (true);

-- Game players policies
CREATE POLICY "Allow all operations on game_players" ON game_players
  FOR ALL USING (true) WITH CHECK (true);

-- Player roles policies
CREATE POLICY "Allow all operations on player_roles" ON player_roles
  FOR ALL USING (true) WITH CHECK (true);

-- Rounds policies
CREATE POLICY "Allow all operations on rounds" ON rounds
  FOR ALL USING (true) WITH CHECK (true);

-- Demographics policies
CREATE POLICY "Allow all operations on demographics" ON demographics
  FOR ALL USING (true) WITH CHECK (true);
