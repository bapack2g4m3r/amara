-- =========================================================================
-- Supabase Migration: Admin Panel System Announcements & User Activity RPC (v3)
-- Menambahkan fitur:
-- 1. Tabel system_announcements untuk broadcast banner pengumuman admin
-- 2. RPC admin_get_user_activity_counts untuk menginspeksi aktivitas user
-- =========================================================================

-- 1. Tabel System Announcements
CREATE TABLE IF NOT EXISTS public.system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'urgent'
  is_active BOOLEAN DEFAULT FALSE,
  link_url TEXT,
  link_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: Semua user yang login / publik bisa membaca pengumuman aktif
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.system_announcements;
CREATE POLICY "Anyone can view active announcements"
  ON public.system_announcements
  FOR SELECT
  USING (is_active = TRUE OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE);

-- Policy ALL: Hanya Admin yang bisa mengelola pengumuman
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.system_announcements;
CREATE POLICY "Admins can manage announcements"
  ON public.system_announcements
  FOR ALL
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE);

-- 2. RPC Mengambil Ringkasan Aktivitas Pengguna (admin_get_user_activity_counts)
CREATE OR REPLACE FUNCTION public.admin_get_user_activity_counts(p_target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_is_admin BOOLEAN;
  v_tasks_count INT := 0;
  v_budgets_count INT := 0;
  v_expenses_count INT := 0;
  v_guests_count INT := 0;
  v_vendors_count INT := 0;
  v_savings_count INT := 0;
  v_seserahan_count INT := 0;
BEGIN
  -- Verifikasi Superadmin
  SELECT is_admin INTO v_caller_is_admin 
  FROM public.profiles 
  WHERE id = auth.uid();

  IF v_caller_is_admin IS NOT TRUE AND auth.email() NOT IN ('agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Administrator Amara yang dapat melihat data ini.';
  END IF;

  -- Hitung aktivitas
  SELECT COUNT(*) INTO v_tasks_count FROM public.tasks WHERE user_id = p_target_user_id;
  SELECT COUNT(*) INTO v_budgets_count FROM public.budgets WHERE user_id = p_target_user_id;
  SELECT COUNT(*) INTO v_expenses_count FROM public.expenses WHERE user_id = p_target_user_id;
  SELECT COUNT(*) INTO v_guests_count FROM public.guests WHERE user_id = p_target_user_id;
  SELECT COUNT(*) INTO v_vendors_count FROM public.vendors WHERE user_id = p_target_user_id;
  SELECT COUNT(*) INTO v_savings_count FROM public.savings WHERE user_id = p_target_user_id;
  SELECT COUNT(*) INTO v_seserahan_count FROM public.seserahan WHERE user_id = p_target_user_id;

  RETURN json_build_object(
    'success', true,
    'user_id', p_target_user_id,
    'tasks_count', v_tasks_count,
    'budgets_count', v_budgets_count,
    'expenses_count', v_expenses_count,
    'guests_count', v_guests_count,
    'vendors_count', v_vendors_count,
    'savings_count', v_savings_count,
    'seserahan_count', v_seserahan_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_user_activity_counts(UUID) TO authenticated, service_role;
