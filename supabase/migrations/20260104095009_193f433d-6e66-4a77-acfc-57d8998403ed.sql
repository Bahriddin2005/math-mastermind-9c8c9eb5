-- Create friend_messages table for real-time chat
CREATE TABLE public.friend_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.friend_messages ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
ON public.friend_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create policy: Users can send messages
CREATE POLICY "Users can send messages"
ON public.friend_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Create policy: Users can mark messages as read
CREATE POLICY "Users can update messages they received"
ON public.friend_messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Create index for faster queries
CREATE INDEX idx_friend_messages_sender ON public.friend_messages(sender_id);
CREATE INDEX idx_friend_messages_receiver ON public.friend_messages(receiver_id);
CREATE INDEX idx_friend_messages_created_at ON public.friend_messages(created_at DESC);

-- Enable realtime for friend_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_messages;