-- =========================================================================
-- Supabase Migration: Partner Collaboration (Solusi Bebas Recursion)
-- Jalankan skrip ini di SQL Editor Supabase Anda untuk memulihkan akses data
-- =========================================================================

-- 1. Tambahkan kolom kolaborasi pada tabel profiles (jika belum ada)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS wedding_owner_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS partner_role TEXT DEFAULT 'editor' CHECK (partner_role IN ('editor', 'viewer')),
  ADD COLUMN IF NOT EXISTS partner_email TEXT,
  ADD COLUMN IF NOT EXISTS partner_name TEXT,
  ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_collaborating BOOLEAN DEFAULT FALSE;

-- 2. Index untuk performa pencarian cepat
CREATE INDEX IF NOT EXISTS idx_profiles_wedding_owner ON public.profiles(wedding_owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON public.profiles(invite_code);

-- =========================================================================
-- 3. Fungsi Keamanan (SECURITY DEFINER)
-- Menghindari 'infinite recursion detected in policy for relation profiles'
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_wedding_owner_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT wedding_owner_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_editor_partner(owner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND wedding_owner_id = owner_id 
      AND partner_role = 'editor'
  );
$$;

-- Fungsi Khusus Memutuskan Tautan Pasangan (Aman & Atomic)
CREATE OR REPLACE FUNCTION public.unlink_wedding_partner()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  -- 1. Jika pemanggil adalah Owner:
  -- Putuskan semua pasangan yang memiliki wedding_owner_id = user saat ini
  UPDATE public.profiles 
  SET wedding_owner_id = NULL, 
      partner_role = NULL, 
      is_collaborating = FALSE
  WHERE wedding_owner_id = v_uid;

  -- Reset status kolaborasi dan kode undangan di profil Owner
  UPDATE public.profiles
  SET is_collaborating = FALSE,
      invite_code = NULL
  WHERE id = v_uid;

  -- 2. Jika pemanggil adalah Partner:
  -- Putuskan diri sendiri dari Owner
  UPDATE public.profiles
  SET wedding_owner_id = NULL, 
      partner_role = NULL, 
      is_collaborating = FALSE
  WHERE id = v_uid AND wedding_owner_id IS NOT NULL;
END;
$$;

-- Berikan izin eksekusi ke authenticated dan anon
GRANT EXECUTE ON FUNCTION public.get_wedding_owner_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_editor_partner(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.unlink_wedding_partner() TO authenticated;

-- =========================================================================
-- 4. Kebijakan RLS (Row Level Security) untuk Tabel PROFILES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profile with invite code" ON public.profiles;
CREATE POLICY "Anyone can view profile with invite code" ON public.profiles 
  FOR SELECT USING (invite_code IS NOT NULL);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Partners can view owner profile" ON public.profiles;
CREATE POLICY "Partners can view owner profile" ON public.profiles 
  FOR SELECT USING (
    id = public.get_wedding_owner_id()
    OR wedding_owner_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id 
    OR (id = public.get_wedding_owner_id() AND public.is_editor_partner(id))
    OR wedding_owner_id = auth.uid()
  )
  WITH CHECK (
    true
  );

-- =========================================================================
-- 5. Kebijakan RLS untuk Tabel TASKS (Tugas)
-- =========================================================================
DROP POLICY IF EXISTS "Users and partners can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users and partners can view tasks" ON public.tasks 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_id = public.get_wedding_owner_id()
  );

DROP POLICY IF EXISTS "Users and editor partners can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users and editor partners can insert tasks" ON public.tasks 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users and editor partners can update tasks" ON public.tasks 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users and editor partners can delete tasks" ON public.tasks 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

-- =========================================================================
-- 6. Kebijakan RLS untuk Tabel BUDGETS (Anggaran)
-- =========================================================================
DROP POLICY IF EXISTS "Users and partners can view budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can view own budget" ON public.budgets;
CREATE POLICY "Users and partners can view budgets" ON public.budgets 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_id = public.get_wedding_owner_id()
  );

DROP POLICY IF EXISTS "Users and editor partners can insert budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budget" ON public.budgets;
CREATE POLICY "Users and editor partners can insert budgets" ON public.budgets 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can update budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budget" ON public.budgets;
CREATE POLICY "Users and editor partners can update budgets" ON public.budgets 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can delete budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budget" ON public.budgets;
CREATE POLICY "Users and editor partners can delete budgets" ON public.budgets 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

-- =========================================================================
-- 7. Kebijakan RLS untuk Tabel EXPENSES (Pengeluaran)
-- =========================================================================
DROP POLICY IF EXISTS "Users and partners can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users and partners can view expenses" ON public.expenses 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_id = public.get_wedding_owner_id()
  );

DROP POLICY IF EXISTS "Users and editor partners can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users and editor partners can insert expenses" ON public.expenses 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users and editor partners can update expenses" ON public.expenses 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users and editor partners can delete expenses" ON public.expenses 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

-- =========================================================================
-- 8. Kebijakan RLS untuk Tabel VENDORS (Vendor)
-- =========================================================================
DROP POLICY IF EXISTS "Users and partners can view vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can view own vendors" ON public.vendors;
CREATE POLICY "Users and partners can view vendors" ON public.vendors 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_id = public.get_wedding_owner_id()
  );

DROP POLICY IF EXISTS "Users and editor partners can insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can insert own vendors" ON public.vendors;
CREATE POLICY "Users and editor partners can insert vendors" ON public.vendors 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can update vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can update own vendors" ON public.vendors;
CREATE POLICY "Users and editor partners can update vendors" ON public.vendors 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can delete vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete own vendors" ON public.vendors;
CREATE POLICY "Users and editor partners can delete vendors" ON public.vendors 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

-- =========================================================================
-- 9. Kebijakan RLS untuk Tabel GUESTS (Daftar Tamu)
-- =========================================================================
DROP POLICY IF EXISTS "Users and partners can view guests" ON public.guests;
DROP POLICY IF EXISTS "Users can view own guests" ON public.guests;
CREATE POLICY "Users and partners can view guests" ON public.guests 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR user_id = public.get_wedding_owner_id()
  );

DROP POLICY IF EXISTS "Users and editor partners can insert guests" ON public.guests;
DROP POLICY IF EXISTS "Users can insert own guests" ON public.guests;
CREATE POLICY "Users and editor partners can insert guests" ON public.guests 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can update guests" ON public.guests;
DROP POLICY IF EXISTS "Users can update own guests" ON public.guests;
CREATE POLICY "Users and editor partners can update guests" ON public.guests 
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );

DROP POLICY IF EXISTS "Users and editor partners can delete guests" ON public.guests;
DROP POLICY IF EXISTS "Users can delete own guests" ON public.guests;
CREATE POLICY "Users and editor partners can delete guests" ON public.guests 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR (user_id = public.get_wedding_owner_id() AND public.is_editor_partner(user_id))
  );
