-- =========================================================================
-- Supabase Migration: Fix Google Auth Access Code & Gatekeeper Protection
-- Memastikan pengguna Google Auth wajib mengklaim kode akses dan tidak bisa
-- membypass pendaftaran tanpa kode yang valid.
-- =========================================================================

-- 1. Tambahkan kolom status akses pada profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS has_access BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS access_type TEXT;

-- 2. Perbaiki fungsi claim_access_code agar otomatis mengupdate profil
CREATE OR REPLACE FUNCTION public.claim_access_code(
  p_code TEXT, 
  p_email TEXT, 
  p_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_rec RECORD;
  v_clean_code TEXT := UPPER(TRIM(p_code));
  v_target_user_id UUID := COALESCE(p_user_id, auth.uid());
BEGIN
  -- Kunci baris agar tidak terjadi race condition
  SELECT * INTO v_rec 
  FROM public.access_codes 
  WHERE UPPER(code) = v_clean_code 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses tidak ditemukan');
  END IF;

  IF v_rec.status = 'revoked' THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses telah dinonaktifkan oleh administrator');
  END IF;

  IF v_rec.status = 'used' OR v_rec.used_count >= v_rec.max_uses THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses sudah terpakai dan tidak dapat digunakan lagi');
  END IF;

  IF v_rec.expires_at IS NOT NULL AND v_rec.expires_at < NOW() THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses telah kedaluwarsa');
  END IF;

  -- Update status pemakaian kode akses
  UPDATE public.access_codes
  SET 
    used_count = used_count + 1,
    status = CASE WHEN used_count + 1 >= max_uses THEN 'used' ELSE 'active' END,
    used_by_email = LOWER(TRIM(p_email)),
    used_by_user_id = v_target_user_id,
    used_at = NOW()
  WHERE id = v_rec.id;

  -- Beri hak akses ke profil pengguna
  IF v_target_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, has_access, access_type)
    VALUES (v_target_user_id, TRUE, v_rec.type)
    ON CONFLICT (id) DO UPDATE SET has_access = TRUE, access_type = v_rec.type;
  END IF;

  RETURN json_build_object(
    'success', TRUE,
    'code', v_rec.code,
    'type', v_rec.type,
    'duration_days', v_rec.duration_days,
    'message', 'Kode akses berhasil diaktifkan'
  );
END;
$$;

-- 3. Fungsi Pemeriksaan Otorisasi Akses Pengguna (Gatekeeper)
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
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('has_access', FALSE, 'reason', 'unauthenticated');
  END IF;

  -- 1. Superadmin utama selalu memiliki akses penuh
  IF v_email = 'agung5s7@gmail.com' THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', TRUE, 'access_type', 'admin');
  END IF;

  -- Ambil data profil
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid LIMIT 1;

  -- 2. Akun dengan is_admin = TRUE
  IF FOUND AND v_profile.is_admin = TRUE THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', TRUE, 'access_type', 'admin');
  END IF;

  -- 3. Pasangan yang diundang (kolaborasi)
  IF FOUND AND v_profile.wedding_owner_id IS NOT NULL THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'partner');
  END IF;

  -- 4. Akun yang sudah ditandai has_access
  IF FOUND AND v_profile.has_access = TRUE THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', v_profile.access_type);
  END IF;

  -- 5. Cek apakah pengguna pernah mengklaim kode di access_codes
  IF EXISTS (
    SELECT 1 FROM public.access_codes 
    WHERE used_by_user_id = v_uid OR LOWER(used_by_email) = v_email
  ) THEN
    INSERT INTO public.profiles (id, has_access)
    VALUES (v_uid, TRUE)
    ON CONFLICT (id) DO UPDATE SET has_access = TRUE;

    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'licensed');
  END IF;

  -- 6. Akun lama yang sudah mengisi nama / tanggal pernikahan sebelum sistem lisensi aktif
  IF FOUND AND (v_profile.partner_1_name IS NOT NULL OR v_profile.wedding_date IS NOT NULL) THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'legacy');
  END IF;

  -- Belum memiliki lisensi
  RETURN json_build_object('has_access', FALSE, 'reason', 'no_license');
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_access_code(TEXT, TEXT, UUID) TO anon, authenticated;
