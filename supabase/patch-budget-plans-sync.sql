-- ==============================================================================
-- Migration Patch: Full Multi-Plan Budgeting Sync (Mobile/PWA & Desktop)
-- ==============================================================================
-- Skrip ini 100% aman (non-destructive) untuk database production yang sedang aktif.
-- Menggunakan IF NOT EXISTS sehingga data user yang sudah ada tidak akan hilang atau terganggu.
-- Jalankan di Supabase SQL Editor jika fitur Plan B / Custom Plan belum tersinkron antar-perangkat.

-- 1. Pastikan kolom pendukung plan_id dan lainnya tersedia di tabel expenses
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'plan_a',
ADD COLUMN IF NOT EXISTS planned_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS vendor_name TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS deadline DATE;

-- Pastikan kolom amount memiliki default 0
ALTER TABLE public.expenses 
ALTER COLUMN amount SET DEFAULT 0;

-- 2. Pastikan tabel budget_plans tersedia di database live
CREATE TABLE IF NOT EXISTS public.budget_plans (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index user_id untuk performa query cepat
CREATE INDEX IF NOT EXISTS idx_budget_plans_user_id ON public.budget_plans(user_id);

-- 3. Row Level Security (RLS) untuk budget_plans (Mendukung Owner & Pasangan/Editor)
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and partners can view budget_plans" ON public.budget_plans;
CREATE POLICY "Users and partners can view budget_plans" ON public.budget_plans 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE (id = auth.uid() OR wedding_owner_id = user_id)
    )
  );

DROP POLICY IF EXISTS "Users and editor partners can insert budget_plans" ON public.budget_plans;
CREATE POLICY "Users and editor partners can insert budget_plans" ON public.budget_plans 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE (id = auth.uid() OR wedding_owner_id = user_id) 
        AND partner_role = 'editor'
    )
  );

DROP POLICY IF EXISTS "Users and editor partners can update budget_plans" ON public.budget_plans;
CREATE POLICY "Users and editor partners can update budget_plans" ON public.budget_plans 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE (id = auth.uid() OR wedding_owner_id = user_id) 
        AND partner_role = 'editor'
    )
  );

DROP POLICY IF EXISTS "Users and editor partners can delete budget_plans" ON public.budget_plans;
CREATE POLICY "Users and editor partners can delete budget_plans" ON public.budget_plans 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE (id = auth.uid() OR wedding_owner_id = user_id) 
        AND partner_role = 'editor'
    )
  );

-- 4. Supabase Realtime Logical Replication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'budget_plans'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_plans;
  END IF;
END $$;

ALTER TABLE public.budget_plans REPLICA IDENTITY FULL;

-- 5. Refresh Schema Cache Supabase
NOTIFY pgrst, 'reload config';
