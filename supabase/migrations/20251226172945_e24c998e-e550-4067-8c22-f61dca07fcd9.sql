-- Create testimonials table for user reviews
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'O''quvchi',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view active testimonials
CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can create testimonials
CREATE POLICY "Admins can create testimonials"
ON public.testimonials
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update testimonials
CREATE POLICY "Admins can update testimonials"
ON public.testimonials
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete testimonials
CREATE POLICY "Admins can delete testimonials"
ON public.testimonials
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial testimonials
INSERT INTO public.testimonials (name, role, content, rating, order_index) VALUES
('Aziza Karimova', 'O''qituvchi', 'IQROMAX platformasi bolalarimning matematik qobiliyatini sezilarli darajada oshirdi. Juda qulay va interaktiv!', 5, 1),
('Jasur Aliyev', 'Talaba', 'Mental arifmetika mashqlari juda qiziqarli. Har kuni mashq qilish odatga aylandi.', 5, 2),
('Dilnoza Rahimova', 'Ota-ona', 'Farzandim uchun eng yaxshi platforma. Video darslar juda tushunarli tushuntirilgan.', 5, 3),
('Bobur Toshmatov', '5-sinf o''quvchisi', 'Men bu platformada 3 oyda juda ko''p narsani o''rgandim. Endi tez hisoblay olaman!', 5, 4);

-- Create a function to get platform statistics
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_problems_solved BIGINT,
  total_lessons BIGINT,
  total_courses BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles)::BIGINT as total_users,
    (SELECT COALESCE(SUM(total_problems_solved), 0) FROM public.profiles)::BIGINT as total_problems_solved,
    (SELECT COUNT(*) FROM public.lessons WHERE is_published = true)::BIGINT as total_lessons,
    (SELECT COUNT(*) FROM public.courses WHERE is_published = true)::BIGINT as total_courses;
END;
$$;