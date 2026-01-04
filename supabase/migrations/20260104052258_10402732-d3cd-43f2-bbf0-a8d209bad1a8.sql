-- Add formula_type column to game_sessions for topic-based analysis
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS formula_type TEXT DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_formula_type ON public.game_sessions(formula_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_formula ON public.game_sessions(user_id, formula_type);