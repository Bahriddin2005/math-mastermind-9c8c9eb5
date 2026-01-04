-- Do'konga yangi mahsulotlar qo'shish

-- Avatar ramkalari
INSERT INTO public.shop_items (name, description, price, icon, category, item_type, is_available) VALUES
('Oltin ramka', 'Avatarni oltin ramka bilan bezash', 500, '🏆', 'cosmetic', 'cosmetic', true),
('Kumush ramka', 'Avatarni kumush ramka bilan bezash', 300, '🥈', 'cosmetic', 'cosmetic', true),
('Yulduzli ramka', 'Avatarni yulduzlar bilan bezash', 400, '⭐', 'cosmetic', 'cosmetic', true),
('Olovli ramka', 'Avatarni olov effekti bilan bezash', 600, '🔥', 'cosmetic', 'cosmetic', true),
('Kamalak ramka', 'Avatarni kamalak ranglari bilan bezash', 450, '🌈', 'cosmetic', 'cosmetic', true);

-- Texnika mahsulotlari
INSERT INTO public.shop_items (name, description, price, icon, category, item_type, is_available) VALUES
('Naushnik', 'Yuqori sifatli simsiz naushnik', 5000, '🎧', 'tech', 'prize', true),
('Smart soat', 'Sport va sog''liq uchun smart soat', 8000, '⌚', 'tech', 'prize', true),
('Planshet', 'O''qish va o''yin uchun planshet', 15000, '📱', 'tech', 'prize', true),
('Televizor', '43 dyuymli smart televizor', 25000, '📺', 'tech', 'prize', true),
('Noutbuk', 'O''qish uchun noutbuk', 50000, '💻', 'tech', 'prize', true),
('Telefon', 'Yangi model smartfon', 35000, '📲', 'tech', 'prize', true),
('Kamera', 'Raqamli kamera', 20000, '📷', 'tech', 'prize', true);

-- Maxsus effektlar
INSERT INTO public.shop_items (name, description, price, icon, category, item_type, is_available) VALUES
('Konfetti effekti', 'To''g''ri javoblarda konfetti yog''adi', 800, '🎊', 'effect', 'cosmetic', true),
('Yulduz effekti', 'To''g''ri javoblarda yulduzlar uchadi', 600, '✨', 'effect', 'cosmetic', true),
('Mushak effekti', 'To''g''ri javoblarda raketalar uchadi', 700, '🚀', 'effect', 'cosmetic', true);

-- VIP imtiyozlar
INSERT INTO public.shop_items (name, description, price, icon, category, item_type, is_available) VALUES
('VIP 1 hafta', '7 kun davomida VIP imtiyozlar: 2x XP, maxsus badgelar', 1000, '👑', 'vip', 'subscription', true),
('VIP 1 oy', '30 kun davomida VIP imtiyozlar: 2x XP, maxsus badgelar', 3500, '💎', 'vip', 'subscription', true),
('VIP 3 oy', '90 kun davomida VIP imtiyozlar: 2x XP, maxsus badgelar', 9000, '🌟', 'vip', 'subscription', true);

-- Kunlik/haftalik vazifalar uchun jadval
CREATE TABLE public.game_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_type TEXT NOT NULL DEFAULT 'daily', -- daily, weekly
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL DEFAULT 1,
  reward_coins INTEGER NOT NULL DEFAULT 10,
  reward_xp INTEGER NOT NULL DEFAULT 5,
  icon TEXT DEFAULT '🎯',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Foydalanuvchi vazifa jarayoni
CREATE TABLE public.user_task_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.game_tasks(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS policies for game_tasks
ALTER TABLE public.game_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tasks"
  ON public.game_tasks
  FOR SELECT
  USING (is_active = true);

-- RLS policies for user_task_progress
ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task progress"
  ON public.user_task_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task progress"
  ON public.user_task_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task progress"
  ON public.user_task_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Default vazifalar
INSERT INTO public.game_tasks (task_type, title, description, target_value, reward_coins, reward_xp, icon) VALUES
('daily', '5 ta masala yech', 'Bugun 5 ta masala yeching', 5, 20, 10, '📝'),
('daily', '3 ta streak', 'Ketma-ket 3 ta to''g''ri javob bering', 3, 30, 15, '🔥'),
('daily', '1 ta level yakunla', 'Bugun 1 ta levelni yakunlang', 1, 50, 25, '⭐'),
('daily', '100 coin yig''', 'Bugun 100 ta coin yig''ing', 100, 25, 10, '💰'),
('weekly', '50 ta masala yech', 'Bu hafta 50 ta masala yeching', 50, 200, 100, '🎯'),
('weekly', '10 ta streak', 'Bu hafta 10 ta streak to''plang', 10, 150, 75, '🔥'),
('weekly', '5 ta level yakunla', 'Bu hafta 5 ta levelni yakunlang', 5, 300, 150, '🏆'),
('weekly', '500 coin yig''', 'Bu hafta 500 ta coin yig''ing', 500, 100, 50, '💎');