-- =========================================================================
-- Supabase Migration: Sinkronisasi Seserahan, Dana Nikah (Savings), 
-- Budget Plans, & Aktivasi Realtime Replication
-- 
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- =========================================================================

-- 1. TABEL SESERAHAN
CREATE TABLE IF NOT EXISTS public.seserahan (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  price NUMERIC DEFAULT 0,
  link TEXT,
  is_bought BOOLEAN DEFAULT FALSE,
  badge_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seserahan_user_id ON public.seserahan(user_id);

-- 2. TABEL SAVINGS (DANA NIKAH)
CREATE TABLE IF NOT EXISTS public.savings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  amount NUMERIC DEFAULT 0,
  source_category TEXT DEFAULT 'Tabungan CPP',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_user_id ON public.savings(user_id);

-- 3. TABEL BUDGET PLANS (Plan A, Plan B, dst)
CREATE TABLE IF NOT EXISTS public.budget_plans (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_plans_user_id ON public.budget_plans(user_id);

-- =========================================================================
-- 4. KEBIJAKAN ROW LEVEL SECURITY (RLS) UNTUK KOLABORASI PASANGAN
-- =========================================================================

-- Enable RLS
ALTER TABLE public.seserahan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;

-- RLS: SESERAHAN
DROP POLICY IF EXISTS "Users and partners can view seserahan" ON public.seserahan;
CREATE POLICY "Users and partners can view seserahan" ON public.seserahan 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_id = public.get_wedding_owner_id()
  );

DROP POLICY IF EXISTS "Users and editor partners can insert seserahan" ON public.seserahan;
CREATE POLICY "Users and editor partners can insert seserahan" ON public.seserahan 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can update seserahan" ON public.seserahan;
CREATE POLICY "Users and editor partners can update seserahan" ON public.seserahan 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can delete seserahan" ON public.seserahan;
CREATE POLICY "Users and editor partners can delete seserahan" ON public.seserahan 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

-- RLS: SAVINGS (DANA NIKAH)
DROP POLICY IF EXISTS "Users and partners can view savings" ON public.savings;
CREATE POLICY "Users and partners can view savings" ON public.savings 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_id = public.get_wedding_owner_id()
  );

DROP POLICY IF EXISTS "Users and editor partners can insert savings" ON public.savings;
CREATE POLICY "Users and editor partners can insert savings" ON public.savings 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can update savings" ON public.savings;
CREATE POLICY "Users and editor partners can update savings" ON public.savings 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can delete savings" ON public.savings;
CREATE POLICY "Users and editor partners can delete savings" ON public.savings 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

-- RLS: BUDGET PLANS
DROP POLICY IF EXISTS "Users and partners can view budget_plans" ON public.budget_plans;
CREATE POLICY "Users and partners can view budget_plans" ON public.budget_plans 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_id = public.get_wedding_owner_id()
  );

DROP POLICY IF EXISTS "Users and editor partners can insert budget_plans" ON public.budget_plans;
CREATE POLICY "Users and editor partners can insert budget_plans" ON public.budget_plans 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can update budget_plans" ON public.budget_plans;
CREATE POLICY "Users and editor partners can update budget_plans" ON public.budget_plans 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can delete budget_plans" ON public.budget_plans;
CREATE POLICY "Users and editor partners can delete budget_plans" ON public.budget_plans 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

-- =========================================================================
-- 5. AKTIVASI SUPABASE REALTIME REPLICATION
-- Mengizinkan browser menerima notifikasi perubahan data secara instan
-- =========================================================================
DO $$
BEGIN
  -- Tambahkan tabel ke publication realtime jika belum terdaftar
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.savings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.seserahan;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_plans;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
