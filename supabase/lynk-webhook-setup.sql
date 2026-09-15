-- =========================================================================
-- Supabase Migration: Lynk.id Webhook & Automatic Access Integration
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- =========================================================================

-- 1. Pastikan kolom dan index pada access_codes sudah optimal
CREATE INDEX IF NOT EXISTS idx_access_codes_used_by_email 
  ON public.access_codes (LOWER(used_by_email));

CREATE INDEX IF NOT EXISTS idx_access_codes_used_by_user_id 
  ON public.access_codes (used_by_user_id);

-- 2. Update Fungsi check_user_access()
-- Menambahkan auto-link akun: Jika ada order dari Lynk.id dengan email pembeli
-- yang cocok dengan user yang sedang login, sistem otomatis mengikat lisensi
-- ke akun user tersebut dan membuka akses secara instan!
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

  -- 4. Akun yang sudah ditandai has_access = TRUE
  IF FOUND AND v_profile.has_access = TRUE THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', COALESCE(v_profile.access_type, 'licensed'));
  END IF;

  -- 5. Cek apakah ada kode akses yang terikat dengan user_id atau email pembeli (dari Lynk.id / Manual)
  SELECT * INTO v_matched_code 
  FROM public.access_codes 
  WHERE (used_by_user_id = v_uid OR LOWER(used_by_email) = v_email)
    AND status IN ('active', 'used')
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Update binding jika kode sebelumnya belum terikat ke user_id ini
    UPDATE public.access_codes 
    SET 
      used_by_user_id = v_uid,
      used_count = GREATEST(used_count, 1),
      status = 'used',
      used_at = COALESCE(used_at, NOW())
    WHERE id = v_matched_code.id;

    -- Update status akses di profil pengguna
    INSERT INTO public.profiles (id, has_access, access_type)
    VALUES (v_uid, TRUE, v_matched_code.type)
    ON CONFLICT (id) DO UPDATE 
      SET has_access = TRUE, 
          access_type = EXCLUDED.access_type;

    RETURN json_build_object(
      'has_access', TRUE, 
      'is_admin', FALSE, 
      'access_type', v_matched_code.type,
      'code', v_matched_code.code
    );
  END IF;

  -- 6. Akun lama (legacy) yang sudah mengisi nama / tanggal pernikahan sebelum sistem lisensi aktif
  IF FOUND AND (v_profile.partner_1_name IS NOT NULL OR v_profile.wedding_date IS NOT NULL) THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'legacy');
  END IF;

  -- Pengguna belum memiliki lisensi
  RETURN json_build_object('has_access', FALSE, 'reason', 'no_license');
END;
$$;

-- Grant izin eksekusi ke authenticated user
GRANT EXECUTE ON FUNCTION public.check_user_access() TO authenticated;

-- 3. Fungsi Cek Apakah Email Memiliki Pesanan di Lynk.id (Bisa dicek oleh anon saat sign up)
CREATE OR REPLACE FUNCTION public.check_email_has_order(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_email IS NULL OR TRIM(p_email) = '' THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.access_codes 
    WHERE LOWER(used_by_email) = LOWER(TRIM(p_email))
      AND status IN ('active', 'used')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_email_has_order(TEXT) TO anon, authenticated;
