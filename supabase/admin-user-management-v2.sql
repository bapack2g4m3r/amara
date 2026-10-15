-- =========================================================================
-- Supabase Migration: Admin Panel User Management & CRUD Controls (v2)
-- Memperbaiki & menyempurnakan seluruh fitur CRUD Admin:
-- 1. Kunci Akses (Revoke): Mengunci akun secara instan & permanen tanpa bisa auto-bypass
-- 2. Beri Akses (Grant Trial/Paid): Memberikan akses langsung tanpa kode
-- 3. Hapus Pengguna (Delete): Menghapus user & seluruh relasi data tanpa error FK
-- 4. Jadikan Admin (Toggle Admin): Mengangkat / mencabut role admin
-- 5. List Users: Menampilkan status lisensi (Paid, Free Trial, Terkunci, Pasangan) secara akurat
-- =========================================================================

-- 1. Pastikan kolom lisensi & kontrol admin tersedia di public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS has_access BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS access_type TEXT,
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Jadikan akun utama Superadmin secara otomatis
UPDATE public.profiles 
SET is_admin = TRUE, has_access = TRUE, access_type = 'admin' 
WHERE id IN (SELECT id FROM auth.users WHERE LOWER(email) = 'agung5s7@gmail.com');

-- =========================================================================
-- 2. Fungsi Mengambil Seluruh User Supabase (admin_get_all_users)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
  v_is_admin BOOLEAN := FALSE;
  v_result JSON;
BEGIN
  -- Verifikasi pemanggil adalah Superadmin
  SELECT is_admin INTO v_is_admin 
  FROM public.profiles 
  WHERE id = auth.uid() 
  LIMIT 1;

  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan mengakses data pengguna.';
  END IF;

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
      
      -- has_access: Evaluasi status aktif yang sebenarnya
      CASE 
        WHEN COALESCE(p.is_admin, FALSE) OR LOWER(u.email) = 'agung5s7@gmail.com' THEN TRUE
        WHEN p.access_type = 'locked' OR p.has_access = FALSE THEN FALSE
        WHEN p.access_type = 'paid' THEN TRUE
        WHEN p.access_type = 'trial' AND p.trial_expires_at IS NOT NULL AND p.trial_expires_at < NOW() THEN FALSE
        WHEN p.access_type = 'trial' THEN TRUE
        WHEN p.wedding_owner_id IS NOT NULL AND (owner_p.has_access = TRUE OR owner_p.is_admin = TRUE) THEN TRUE
        ELSE COALESCE(p.has_access, FALSE)
      END AS has_access,

      p.access_type,
      p.trial_expires_at,

      -- is_trial_expired
      CASE 
        WHEN p.access_type = 'trial' AND p.trial_expires_at IS NOT NULL AND p.trial_expires_at < NOW() THEN TRUE
        ELSE FALSE
      END AS is_trial_expired,

      COALESCE(p.partner_1_name, owner_p.partner_1_name) AS partner_1_name,
      COALESCE(p.partner_2_name, owner_p.partner_2_name) AS partner_2_name,
      COALESCE(p.wedding_date, owner_p.wedding_date) AS wedding_date,
      COALESCE(p.wedding_location, owner_p.wedding_location) AS wedding_location,
      p.wedding_owner_id,
      p.is_collaborating,
      p.partner_role,

      -- license_type: Status lisensi akurat untuk badge di UI
      CASE 
        WHEN p.access_type = 'locked' OR p.has_access = FALSE THEN 'locked'
        WHEN p.access_type IS NOT NULL THEN p.access_type
        WHEN p.wedding_owner_id IS NOT NULL THEN 'partner'
        ELSE COALESCE(
          (
            SELECT ac.type 
            FROM public.access_codes ac 
            WHERE (ac.used_by_user_id = u.id OR LOWER(ac.used_by_email) = LOWER(u.email))
              AND ac.status NOT IN ('revoked', 'expired')
            ORDER BY ac.created_at DESC 
            LIMIT 1
          ),
          'locked'
        )
      END AS license_type,

      (
        SELECT ac.code 
        FROM public.access_codes ac 
        WHERE ac.used_by_user_id = u.id OR LOWER(ac.used_by_email) = LOWER(u.email)
        ORDER BY ac.created_at DESC 
        LIMIT 1
      ) AS license_code
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LEFT JOIN public.profiles owner_p ON owner_p.id = p.wedding_owner_id
    ORDER BY u.created_at DESC
  ) u_data;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- =========================================================================
-- 3. Fungsi KUNCI AKSES (admin_revoke_direct_access)
-- Mengunci akun pengguna secara instan & mematikan semua jalan tembus
-- =========================================================================
CREATE OR REPLACE FUNCTION public.admin_revoke_direct_access(
  p_target_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
  v_is_admin BOOLEAN := FALSE;
  v_target_email TEXT;
BEGIN
  -- Verifikasi Superadmin
  SELECT is_admin INTO v_is_admin 
  FROM public.profiles 
  WHERE id = auth.uid() 
  LIMIT 1;

  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan mengunci akses.';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_target_user_id;

  IF LOWER(v_target_email) = 'agung5s7@gmail.com' OR p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Demi keamanan, Anda tidak dapat mengunci akun Superadmin utama Anda sendiri.';
  END IF;

  -- 1. Kunci di tabel profiles: has_access = FALSE, access_type = 'locked'
  UPDATE public.profiles 
  SET has_access = FALSE, 
      access_type = 'locked',
      trial_expires_at = NOW() - INTERVAL '1 day',
      wedding_owner_id = NULL,
      is_collaborating = FALSE,
      partner_role = NULL,
      updated_at = NOW()
  WHERE id = p_target_user_id;

  -- 2. Nonaktifkan semua kode akses yang pernah diklaim atau terikat dengan email/user_id ini
  UPDATE public.access_codes 
  SET status = 'revoked'
  WHERE (used_by_user_id = p_target_user_id OR LOWER(used_by_email) = LOWER(v_target_email))
    AND status IN ('active', 'used');

  -- 3. Jika user ini adalah owner yang punya pasangan, putuskan pasangan agar pasangan juga tidak bypass
  UPDATE public.profiles
  SET wedding_owner_id = NULL,
      is_collaborating = FALSE
  WHERE wedding_owner_id = p_target_user_id;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Akses untuk akun ' || COALESCE(v_target_email, '') || ' berhasil dikunci. Pengguna kini dicegat di layar aktivasi.'
  );
END;
$$;

-- =========================================================================
-- 4. Fungsi BERI AKSES LANGSUNG (admin_grant_direct_access)
-- Memberikan akses Free Trial (14 hari) atau Paid (Permanen) secara instan
-- =========================================================================
CREATE OR REPLACE FUNCTION public.admin_grant_direct_access(
  p_target_user_id UUID, 
  p_access_type TEXT DEFAULT 'paid'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
  v_is_admin BOOLEAN := FALSE;
  v_target_email TEXT;
  v_trial_expires TIMESTAMPTZ := NULL;
  v_clean_type TEXT := LOWER(TRIM(p_access_type));
BEGIN
  -- Verifikasi Superadmin
  SELECT is_admin INTO v_is_admin 
  FROM public.profiles 
  WHERE id = auth.uid() 
  LIMIT 1;

  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan memberikan akses.';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_target_user_id;

  IF v_clean_type NOT IN ('paid', 'trial') THEN
    v_clean_type := 'paid';
  END IF;

  IF v_clean_type = 'trial' THEN
    v_trial_expires := NOW() + INTERVAL '14 days';
  END IF;

  -- Update / Insert profil target
  INSERT INTO public.profiles (id, has_access, access_type, trial_expires_at, updated_at)
  VALUES (p_target_user_id, TRUE, v_clean_type, v_trial_expires, NOW())
  ON CONFLICT (id) DO UPDATE 
    SET has_access = TRUE, 
        access_type = v_clean_type,
        trial_expires_at = v_trial_expires,
        updated_at = NOW();

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Akses ' || UPPER(v_clean_type) || ' berhasil diberikan kepada ' || COALESCE(v_target_email, '') || '.'
  );
END;
$$;

-- =========================================================================
-- 5. Fungsi HAPUS PENGGUNA PERMANEN (admin_delete_user)
-- Membersihkan seluruh relasi tabel agar tidak terhambat foreign key
-- =========================================================================
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  p_target_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_email TEXT := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
  v_is_admin BOOLEAN := FALSE;
  v_target_email TEXT;
BEGIN
  -- Verifikasi Superadmin
  SELECT is_admin INTO v_is_admin 
  FROM public.profiles 
  WHERE id = auth.uid() 
  LIMIT 1;

  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan menghapus pengguna.';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_target_user_id;

  IF LOWER(v_target_email) = 'agung5s7@gmail.com' OR p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Demi keamanan, Anda tidak dapat menghapus akun Superadmin utama Anda sendiri.';
  END IF;

  -- 1. Bersihkan seluruh child data pernikahan milik target user
  DELETE FROM public.tasks WHERE user_id = p_target_user_id;
  DELETE FROM public.expenses WHERE user_id = p_target_user_id;
  DELETE FROM public.budgets WHERE user_id = p_target_user_id;
  DELETE FROM public.vendors WHERE user_id = p_target_user_id;
  DELETE FROM public.guests WHERE user_id = p_target_user_id;
  DELETE FROM public.savings WHERE user_id = p_target_user_id;
  DELETE FROM public.seserahan WHERE user_id = p_target_user_id;
  DELETE FROM public.budget_plans WHERE user_id = p_target_user_id;

  -- 2. Putuskan pasangan yang terhubung ke user ini
  UPDATE public.profiles 
  SET wedding_owner_id = NULL, is_collaborating = FALSE 
  WHERE wedding_owner_id = p_target_user_id;

  -- 3. Lepas ikatan kode akses
  UPDATE public.access_codes 
  SET used_by_user_id = NULL, 
      used_by_email = NULL,
      status = 'revoked'
  WHERE used_by_user_id = p_target_user_id OR LOWER(used_by_email) = LOWER(v_target_email);

  -- 4. Hapus dari profiles
  DELETE FROM public.profiles WHERE id = p_target_user_id;

  -- 5. Hapus user dari sistem autentikasi Supabase
  DELETE FROM auth.users WHERE id = p_target_user_id;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Pengguna ' || COALESCE(v_target_email, '') || ' dan seluruh datanya berhasil dihapus permanen.'
  );
END;
$$;

-- =========================================================================
-- 6. Fungsi UBAH ROLE ADMIN (admin_toggle_user_admin)
-- =========================================================================
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
  v_caller_email TEXT := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
  v_is_admin BOOLEAN := FALSE;
  v_target_email TEXT;
BEGIN
  SELECT is_admin INTO v_is_admin 
  FROM public.profiles 
  WHERE id = auth.uid() 
  LIMIT 1;

  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan mengubah role admin.';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_target_user_id;

  IF LOWER(v_target_email) = 'agung5s7@gmail.com' AND p_new_is_admin = FALSE THEN
    RAISE EXCEPTION 'Demi keamanan, role Superadmin utama tidak dapat dicabut.';
  END IF;

  UPDATE public.profiles 
  SET is_admin = p_new_is_admin 
  WHERE id = p_target_user_id;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Status admin untuk ' || COALESCE(v_target_email, '') || ' berhasil diubah menjadi ' || CASE WHEN p_new_is_admin THEN 'Superadmin' ELSE 'Member' END
  );
END;
$$;

-- =========================================================================
-- 7. Update check_user_access() agar segera memblokir akun terkunci
-- =========================================================================
CREATE OR REPLACE FUNCTION public.check_user_access()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT := LOWER(COALESCE(auth.jwt()->>'email', ''));
  v_profile RECORD;
  v_matched_code RECORD;
  v_trial_expires TIMESTAMPTZ;
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('has_access', FALSE, 'reason', 'unauthenticated');
  END IF;

  -- 1. Superadmin utama selalu memiliki akses penuh tanpa syarat
  IF v_email = 'agung5s7@gmail.com' THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', TRUE, 'access_type', 'admin');
  END IF;

  -- Ambil data profil pengguna
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid LIMIT 1;

  -- 2. Jika akun dikunci oleh admin (has_access = FALSE atau access_type = 'locked'): LANGSUNG KUNCI!
  IF FOUND AND (v_profile.access_type = 'locked' OR v_profile.has_access = FALSE) THEN
    RETURN json_build_object('has_access', FALSE, 'reason', 'locked', 'access_type', 'locked');
  END IF;

  -- 3. Akun dengan flag is_admin = TRUE
  IF FOUND AND v_profile.is_admin = TRUE THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', TRUE, 'access_type', 'admin');
  END IF;

  -- 4. Pasangan yang diundang (kolaborasi)
  IF FOUND AND v_profile.wedding_owner_id IS NOT NULL THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'partner');
  END IF;

  -- 5. Akun dengan Lisensi Berbayar (Permanen / Lynk.id)
  IF FOUND AND v_profile.has_access = TRUE AND v_profile.access_type = 'paid' THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'paid');
  END IF;

  -- 6. Akun dengan Tipe Free Trial: Validasi tanggal kedaluwarsa
  IF FOUND AND v_profile.access_type = 'trial' THEN
    v_trial_expires := v_profile.trial_expires_at;

    IF v_trial_expires IS NULL THEN
      v_trial_expires := v_profile.created_at + INTERVAL '14 days';
    END IF;

    IF NOW() >= v_trial_expires THEN
      UPDATE public.profiles 
      SET has_access = FALSE, trial_expires_at = v_trial_expires 
      WHERE id = v_uid;

      RETURN json_build_object(
        'has_access', FALSE, 
        'reason', 'trial_expired', 
        'access_type', 'trial', 
        'expired_at', v_trial_expires
      );
    ELSE
      RETURN json_build_object(
        'has_access', TRUE, 
        'is_admin', FALSE, 
        'access_type', 'trial', 
        'expires_at', v_trial_expires
      );
    END IF;
  END IF;

  -- 7. Cek apakah ada kode akses aktif di tabel access_codes
  SELECT * INTO v_matched_code 
  FROM public.access_codes 
  WHERE (used_by_user_id = v_uid OR LOWER(used_by_email) = v_email)
    AND status IN ('active', 'used')
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    IF v_matched_code.type = 'trial' THEN
      v_trial_expires := COALESCE(v_matched_code.used_at, NOW()) + (COALESCE(v_matched_code.duration_days, 14) || ' days')::INTERVAL;
      
      IF NOW() >= v_trial_expires THEN
        UPDATE public.access_codes SET status = 'expired' WHERE id = v_matched_code.id;
        UPDATE public.profiles SET has_access = FALSE, access_type = 'trial', trial_expires_at = v_trial_expires WHERE id = v_uid;
        RETURN json_build_object('has_access', FALSE, 'reason', 'trial_expired', 'access_type', 'trial', 'expired_at', v_trial_expires);
      ELSE
        UPDATE public.access_codes 
        SET used_by_user_id = v_uid, used_count = GREATEST(used_count, 1), status = 'used', used_at = COALESCE(used_at, NOW())
        WHERE id = v_matched_code.id;

        INSERT INTO public.profiles (id, has_access, access_type, trial_expires_at)
        VALUES (v_uid, TRUE, 'trial', v_trial_expires)
        ON CONFLICT (id) DO UPDATE SET has_access = TRUE, access_type = 'trial', trial_expires_at = v_trial_expires;

        RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'trial', 'expires_at', v_trial_expires);
      END IF;
    ELSE
      UPDATE public.access_codes 
      SET used_by_user_id = v_uid, used_count = GREATEST(used_count, 1), status = 'used', used_at = COALESCE(used_at, NOW())
      WHERE id = v_matched_code.id;

      INSERT INTO public.profiles (id, has_access, access_type, trial_expires_at)
      VALUES (v_uid, TRUE, 'paid', NULL)
      ON CONFLICT (id) DO UPDATE SET has_access = TRUE, access_type = 'paid', trial_expires_at = NULL;

      RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'paid', 'code', v_matched_code.code);
    END IF;
  END IF;

  -- 8. Pengguna baru / belum memiliki lisensi
  RETURN json_build_object('has_access', FALSE, 'reason', 'no_license');
END;
$$;

-- =========================================================================
-- 8. Berikan Hak Akses Eksekusi ke User Authenticated
-- =========================================================================
GRANT EXECUTE ON FUNCTION public.admin_get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_direct_access(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_direct_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_user_admin(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_access() TO authenticated;
