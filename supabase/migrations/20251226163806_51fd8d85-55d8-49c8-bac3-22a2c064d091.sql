-- Multiplayer xonalari jadvali
CREATE TABLE public.multiplayer_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  formula_type TEXT NOT NULL DEFAULT 'oddiy',
  digit_count INTEGER NOT NULL DEFAULT 1,
  speed NUMERIC NOT NULL DEFAULT 0.5,
  problem_count INTEGER NOT NULL DEFAULT 5,
  current_problem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Xona ishtirokchilari jadvali
CREATE TABLE public.multiplayer_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.multiplayer_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  answer INTEGER,
  is_correct BOOLEAN,
  answer_time NUMERIC,
  score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);

-- RLS yoqish
ALTER TABLE public.multiplayer_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_participants ENABLE ROW LEVEL SECURITY;

-- Multiplayer rooms policies
CREATE POLICY "Anyone can view rooms"
ON public.multiplayer_rooms
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create rooms"
ON public.multiplayer_rooms
FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update room"
ON public.multiplayer_rooms
FOR UPDATE
USING (auth.uid() = host_id);

CREATE POLICY "Host can delete room"
ON public.multiplayer_rooms
FOR DELETE
USING (auth.uid() = host_id);

-- Multiplayer participants policies
CREATE POLICY "Anyone can view participants"
ON public.multiplayer_participants
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join rooms"
ON public.multiplayer_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participant"
ON public.multiplayer_participants
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
ON public.multiplayer_participants
FOR DELETE
USING (auth.uid() = user_id);

-- Realtime uchun
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_participants;