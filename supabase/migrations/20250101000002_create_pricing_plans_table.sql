-- Pricing plans jadvalini yaratish (admin narxlarni boshqarish uchun)
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY, -- 'free', 'pro', 'premium'
  name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  yearly_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stripe_monthly_price_id TEXT,
  stripe_yearly_price_id TEXT,
  stripe_product_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  features JSONB DEFAULT '[]'::jsonb, -- Array of features
  popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Default plans
INSERT INTO public.pricing_plans (id, name, description, monthly_price, yearly_price, is_active, popular, sort_order, features) 
VALUES 
  ('free', 'Bepul', 'Boshlang''ich foydalanuvchilar uchun', 0, 0, true, false, 0, '["Kunlik 20 ta mashq", "Asosiy statistika", "Leaderboard raqobat", "Yutuqlar tizimi"]'::jsonb),
  ('pro', 'Pro', 'Faol o''rganuvchilar uchun', 29000, 249000, true, true, 1, '["Cheksiz mashqlar", "Kengaytirilgan statistika", "Shaxsiy o''quv rejasi", "Reklama yo''q", "Priority yordam", "Maxsus yutuqlar"]'::jsonb),
  ('premium', 'Premium', 'Professional darajaga yetish uchun', 49000, 399000, true, false, 2, '["Pro rejadagi barcha imkoniyatlar", "Shaxsiy mentor yordam", "Video darslar", "Sertifikat olish", "Oilaviy paket (3 akkaunt)", "Beta funksiyalarga kirish"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- RLS yoqish
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can view active pricing plans
CREATE POLICY "Anyone can view active pricing plans"
ON public.pricing_plans
FOR SELECT
USING (is_active = true);

-- Admins can view all pricing plans (including inactive)
CREATE POLICY "Admins can view all pricing plans"
ON public.pricing_plans
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert pricing plans
CREATE POLICY "Admins can insert pricing plans"
ON public.pricing_plans
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update pricing plans
CREATE POLICY "Admins can update pricing plans"
ON public.pricing_plans
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete pricing plans
CREATE POLICY "Admins can delete pricing plans"
ON public.pricing_plans
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_pricing_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pricing_plans_updated_at
BEFORE UPDATE ON public.pricing_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_pricing_plans_updated_at();
