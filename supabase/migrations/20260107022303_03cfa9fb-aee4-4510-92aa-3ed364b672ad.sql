-- Add sharing columns to problem_sheets table
ALTER TABLE public.problem_sheets 
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN share_code TEXT UNIQUE;

-- Create index for share_code lookups
CREATE INDEX idx_problem_sheets_share_code ON public.problem_sheets(share_code) WHERE share_code IS NOT NULL;

-- Update RLS policy to allow anyone to view public sheets
CREATE POLICY "Anyone can view public sheets" 
ON public.problem_sheets 
FOR SELECT 
USING (is_public = true);

-- Update existing select policy to include own sheets
DROP POLICY IF EXISTS "Users can view their own sheets" ON public.problem_sheets;
CREATE POLICY "Users can view their own sheets" 
ON public.problem_sheets 
FOR SELECT 
USING (auth.uid() = user_id);