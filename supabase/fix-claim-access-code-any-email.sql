-- =========================================================================
-- Supabase Migration: Fix Claim Access Code for Any Email & FK Constraint Fix
-- Memperbaiki error:
-- "insert or update on table access_codes violates foreign key constraint access_codes_used_by_user_id_fkey"
-- Memungkinkan aktivasi kode lisensi Lynk.id secara aman oleh email mana pun.
-- =========================================================================

-- 1. Hapus constraint foreign key lama jika ada yang salah merujuk ke public.profiles
ALTER TABLE public.access_codes 
  DROP CONSTRAINT IF EXISTS access_codes_used_by_user_id_fkey;

-- 2. Pasang kembali constraint yang benar ke auth.users(id) dengan ON DELETE SET NULL
ALTER TABLE public.access_codes 
  ADD CONSTRAINT access_codes_used_by_user_id_fkey 
  FOREIGN KEY (used_by_user_id) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- 3. Perbaiki fungsi claim_access_code agar:
--    a. Membuat/mengupdate baris profiles TERLEBIH DAHULU (UPSERT)
--    b. Memvalidasi auth.users(id) sebelum menyimpan used_by_user_id
--    c. Mencegah foreign key error selamanya
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
  v_trial_expires TIMESTAMPTZ := NULL;
BEGIN
  -- Validasi input kode
  IF v_clean_code IS NULL OR v_clean_code = '' THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses tidak boleh kosong');
  END IF;

  -- Kunci baris agar tidak terjadi race condition / klaim ganda
  SELECT * INTO v_rec 
  FROM public.access_codes 
  WHERE UPPER(code) = v_clean_code 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses tidak ditemukan atau salah');
  END IF;

  IF v_rec.status = 'revoked' THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses telah dinonaktifkan oleh administrator');
  END IF;

  IF v_rec.status = 'expired' THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses telah kedaluwarsa');
  END IF;

  IF v_rec.status = 'used' OR v_rec.used_count >= v_rec.max_uses THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses sudah terpakai dan tidak dapat digunakan lagi');
  END IF;

  IF v_rec.expires_at IS NOT NULL AND v_rec.expires_at < NOW() THEN
    UPDATE public.access_codes SET status = 'expired' WHERE id = v_rec.id;
    RETURN json_build_object('success', FALSE, 'message', 'Masa klaim kode akses telah kedaluwarsa');
  END IF;

  -- Hitung masa berlaku jika tipe trial
  IF v_rec.type = 'trial' THEN
    v_trial_expires := NOW() + (COALESCE(v_rec.duration_days, 14) || ' days')::INTERVAL;
  END IF;

  -- 1. Berikan hak akses ke profil pengguna TERLEBIH DAHULU (UPSERT)
  -- Ini menjamin data profil sudah ada sebelum relasi foreign key dicek
  IF v_target_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, has_access, access_type, trial_expires_at)
    VALUES (v_target_user_id, TRUE, v_rec.type, v_trial_expires)
    ON CONFLICT (id) DO UPDATE 
      SET has_access = TRUE, 
          access_type = v_rec.type,
          trial_expires_at = v_trial_expires;
  END IF;

  -- 2. Validasi apakah v_target_user_id benar-benar ada di auth.users sebelum set used_by_user_id
  IF v_target_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_target_user_id) THEN
    -- Fallback ke auth.uid() jika p_user_id yang dipassing tidak cocok
    v_target_user_id := auth.uid();
  END IF;

  IF v_target_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_target_user_id) THEN
    -- Jika tetap tidak ada di auth.users (misal user anonim), set NULL agar tidak melanggar foreign key
    v_target_user_id := NULL;
  END IF;

  -- 3. Update status pemakaian kode akses secara aman
  UPDATE public.access_codes
  SET 
    used_count = used_count + 1,
    status = CASE WHEN used_count + 1 >= max_uses THEN 'used' ELSE 'active' END,
    used_by_email = LOWER(TRIM(p_email)),
    used_by_user_id = v_target_user_id,
    used_at = NOW()
  WHERE id = v_rec.id;

  RETURN json_build_object(
    'success', TRUE,
    'code', v_rec.code,
    'type', v_rec.type,
    'duration_days', v_rec.duration_days,
    'trial_expires_at', v_trial_expires,
    'message', 'Kode akses berhasil diaktifkan'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_access_code(TEXT, TEXT, UUID) TO anon, authenticated;
