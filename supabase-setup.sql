-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- Create custom types for game types and difficulties
CREATE TYPE game_type AS ENUM ('addition', 'subtraction', 'multiplication', 'division');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Table: user_stats
-- Stores overall user statistics
CREATE TABLE IF NOT EXISTS user_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_games_played INTEGER DEFAULT 0 NOT NULL,
    total_correct_answers INTEGER DEFAULT 0 NOT NULL,
    total_questions INTEGER DEFAULT 0 NOT NULL,
    best_streak INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    last_played_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one stats record per user
    UNIQUE(user_id)
);

-- Table: game_sessions
-- Stores individual game session data
CREATE TABLE IF NOT EXISTS game_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    game_type game_type NOT NULL,
    difficulty difficulty_level NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    time_spent INTEGER DEFAULT 0 NOT NULL, -- in milliseconds
    streak INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table: level_progress
-- Stores progress for each game type and difficulty combination
CREATE TABLE IF NOT EXISTS level_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_type game_type NOT NULL,
    difficulty difficulty_level NOT NULL,
    games_played INTEGER DEFAULT 0 NOT NULL,
    best_score INTEGER DEFAULT 0 NOT NULL,
    total_correct INTEGER DEFAULT 0 NOT NULL,
    total_questions INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one progress record per user/game_type/difficulty combination
    UNIQUE(user_id, game_type, difficulty)
);

-- Table: badges
-- Stores user achievements and badges
CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(50),
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    criteria JSONB, -- Flexible storage for badge criteria
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one badge per user (prevent duplicate unlocks)
    UNIQUE(user_id, badge_id)
);

-- Create Indexes
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_completed_at ON game_sessions(completed_at);
CREATE INDEX idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX idx_level_progress_user_id ON level_progress(user_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_badges_unlocked_at ON badges(unlocked_at);

-- Partial Indexes for Performance
CREATE INDEX idx_completed_game_sessions ON game_sessions(user_id, completed_at)
WHERE score > 0;

-- Add Check Constraints
ALTER TABLE user_stats 
ADD CONSTRAINT non_negative_stats 
CHECK (total_games_played >= 0 AND total_correct_answers >= 0 AND total_questions >= 0);

ALTER TABLE game_sessions 
ADD CONSTRAINT non_negative_game_score 
CHECK (score >= 0 AND total_questions >= 0 AND correct_answers >= 0);

-- Enable Row Level Security (RLS)
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- user_stats policies
CREATE POLICY "Users can view their own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stats" ON user_stats
    FOR DELETE USING (auth.uid() = user_id);

-- game_sessions policies
CREATE POLICY "Users can view their own sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON game_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- level_progress policies
CREATE POLICY "Users can view their own progress" ON level_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON level_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON level_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON level_progress
    FOR DELETE USING (auth.uid() = user_id);

-- badges policies
CREATE POLICY "Users can view their own badges" ON badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own badges" ON badges
    FOR DELETE USING (auth.uid() = user_id);

-- Functions to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_level_progress_updated_at BEFORE UPDATE ON level_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();