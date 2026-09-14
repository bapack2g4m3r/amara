-- =========================================================================
-- Supabase Migration: Admin User Management & Direct Access Grant
-- Memungkinkan Superadmin melihat, mengelola, serta memberikan akses
-- langsung (Trial / Paid) kepada pengguna tanpa perlu kode.
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- =========================================================================

-- 1. Pastikan kolom has_access dan access_type ada pada profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS has_access BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS access_type TEXT;

-- 2. Fungsi Mengambil Seluruh User Supabase (auth.users + profiles + access_codes)
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := auth.jwt() ->> 'email';
  v_is_admin BOOLEAN := FALSE;
  v_result JSON;
BEGIN
  -- Verifikasi hak akses: apakah pemanggil adalah Superadmin
  SELECT is_admin INTO v_is_admin 
  FROM public.profiles 
  WHERE id = auth.uid() 
  LIMIT 1;

  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan mengakses data pengguna.';
  END IF;

  -- Kumpulkan seluruh user dan informasinya
  SELECT json_agg(u_data) INTO v_result
  FROM (
    SELECT 
      u.id,
      u.email,
      COALESCE(
        u.raw_user_meta_data->>'full_name', 
        u.raw_user_meta_data->>'name', 
        p.partner_1_name,
        split_part(u.email, '@', 1)
      ) AS display_name,
      u.raw_user_meta_data->>'avatar_url' AS avatar_url,
      COALESCE(u.raw_app_meta_data->>'provider', 'email') AS provider,
      u.created_at,
      u.last_sign_in_at,
      COALESCE(p.is_admin, FALSE) AS is_admin,
      COALESCE(p.has_access, FALSE) AS has_access,
      p.access_type,
      p.partner_1_name,
      p.partner_2_name,
      p.wedding_date,
      p.wedding_location,
      p.wedding_owner_id,
      p.is_collaborating,
      p.partner_role,
      COALESCE(
        p.access_type,
        (
          SELECT ac.type 
          FROM public.access_codes ac 
          WHERE ac.used_by_user_id = u.id OR LOWER(ac.used_by_email) = LOWER(u.email)
          ORDER BY ac.created_at DESC 
          LIMIT 1
        ),
        CASE WHEN p.wedding_owner_id IS NOT NULL THEN 'partner' ELSE NULL END
      ) AS license_type,
      (
        SELECT ac.code 
        FROM public.access_codes ac 
        WHERE ac.used_by_user_id = u.id OR LOWER(ac.used_by_email) = LOWER(u.email)
        ORDER BY ac.created_at DESC 
        LIMIT 1
      ) AS license_code
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at DESC
  ) u_data;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 3. Fungsi Mengubah Status Admin Pengguna
CREATE OR REPLACE FUNCTION public.admin_toggle_user_admin(
  p_target_user_id UUID, 
  p_new_is_admin BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := auth.jwt() ->> 'email';
  v_is_admin BOOLEAN := FALSE;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan mengubah status admin.';
  END IF;

  INSERT INTO public.profiles (id, is_admin)
  VALUES (p_target_user_id, p_new_is_admin)
  ON CONFLICT (id) DO UPDATE SET is_admin = p_new_is_admin;

  RETURN json_build_object(
    'success', TRUE, 
    'message', CASE WHEN p_new_is_admin THEN 'Pengguna berhasil dijadikan Admin' ELSE 'Status Admin pengguna berhasil dicabut' END
  );
END;
$$;

-- 4. Fungsi Memberikan Akses Langsung (Bypass Kode)
CREATE OR REPLACE FUNCTION public.admin_grant_direct_access(
  p_target_user_id UUID,
  p_access_type TEXT DEFAULT 'trial'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := auth.jwt() ->> 'email';
  v_is_admin BOOLEAN := FALSE;
  v_target_email TEXT;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan.';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_target_user_id;

  INSERT INTO public.profiles (id, has_access, access_type)
  VALUES (p_target_user_id, TRUE, p_access_type)
  ON CONFLICT (id) DO UPDATE SET has_access = TRUE, access_type = p_access_type;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Akses ' || UPPER(p_access_type) || ' berhasil diberikan kepada ' || COALESCE(v_target_email, '')
  );
END;
$$;

-- 5. Fungsi Mencabut Akses Langsung
CREATE OR REPLACE FUNCTION public.admin_revoke_direct_access(
  p_target_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := auth.jwt() ->> 'email';
  v_is_admin BOOLEAN := FALSE;
  v_target_email TEXT;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan.';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_target_user_id;

  IF v_target_email = 'agung5s7@gmail.com' OR p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Anda tidak dapat mencabut akses Superadmin utama Anda sendiri.';
  END IF;

  UPDATE public.profiles 
  SET has_access = FALSE, access_type = NULL 
  WHERE id = p_target_user_id;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Akses untuk ' || COALESCE(v_target_email, '') || ' berhasil dicabut.'
  );
END;
$$;

-- 6. Fungsi Menghapus Akun Pengguna Secara Aman
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  p_target_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := auth.jwt() ->> 'email';
  v_is_admin BOOLEAN := FALSE;
  v_target_email TEXT;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan menghapus pengguna.';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_target_user_id;

  IF v_target_email = 'agung5s7@gmail.com' OR p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Demi keamanan, Anda tidak dapat menghapus akun Superadmin utama Anda sendiri.';
  END IF;

  DELETE FROM auth.users WHERE id = p_target_user_id;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Pengguna ' || COALESCE(v_target_email, '') || ' berhasil dihapus secara permanen.'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.admin_get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_user_admin(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_direct_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_direct_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
