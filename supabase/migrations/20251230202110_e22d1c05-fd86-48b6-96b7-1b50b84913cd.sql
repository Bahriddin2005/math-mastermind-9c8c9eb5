-- Create weekly_challenges table
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  formula_type TEXT NOT NULL DEFAULT 'hammasi',
  digit_count INTEGER NOT NULL DEFAULT 1,
  speed NUMERIC NOT NULL DEFAULT 0.5,
  problem_count INTEGER NOT NULL DEFAULT 10,
  seed INTEGER NOT NULL DEFAULT floor(random() * 1000000)::integer,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(week_start)
);

-- Create weekly_challenge_results table
CREATE TABLE public.weekly_challenge_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  total_score INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  best_time NUMERIC,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenge_results ENABLE ROW LEVEL SECURITY;

-- Policies for weekly_challenges
CREATE POLICY "Anyone can view weekly challenges" 
ON public.weekly_challenges FOR SELECT USING (true);

CREATE POLICY "Admins can create weekly challenges" 
ON public.weekly_challenges FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update weekly challenges" 
ON public.weekly_challenges FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete weekly challenges" 
ON public.weekly_challenges FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Policies for weekly_challenge_results
CREATE POLICY "Anyone can view weekly results" 
ON public.weekly_challenge_results FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit weekly results" 
ON public.weekly_challenge_results FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly results" 
ON public.weekly_challenge_results FOR UPDATE 
USING (auth.uid() = user_id);

-- Add admin delete policy for daily_challenges and daily_challenge_results
CREATE POLICY "Admins can delete daily challenges" 
ON public.daily_challenges FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete daily challenge results" 
ON public.daily_challenge_results FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update daily challenges" 
ON public.daily_challenges FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));