-- Add views_count column to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN views_count integer DEFAULT 0;

-- Create function to increment views
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts 
  SET views_count = COALESCE(views_count, 0) + 1 
  WHERE id = post_id;
END;
$$;