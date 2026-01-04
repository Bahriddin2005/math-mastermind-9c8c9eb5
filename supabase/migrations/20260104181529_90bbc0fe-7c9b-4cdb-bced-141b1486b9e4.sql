-- Create ghost_battle_results table for storing battle history
CREATE TABLE public.ghost_battle_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ghost_user_id UUID NOT NULL,
  ghost_username TEXT NOT NULL,
  user_score INTEGER NOT NULL DEFAULT 0,
  ghost_score INTEGER NOT NULL DEFAULT 0,
  user_correct INTEGER NOT NULL DEFAULT 0,
  ghost_correct INTEGER NOT NULL DEFAULT 0,
  user_time NUMERIC NOT NULL DEFAULT 0,
  ghost_time NUMERIC NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ghost_battle_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own battle results
CREATE POLICY "Users can view their own ghost battle results"
ON public.ghost_battle_results
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own battle results
CREATE POLICY "Users can insert their own ghost battle results"
ON public.ghost_battle_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_ghost_battle_results_user_id ON public.ghost_battle_results(user_id);
CREATE INDEX idx_ghost_battle_results_created_at ON public.ghost_battle_results(created_at DESC);