-- =========================================================================
-- Supabase Migration: Lynk.id Webhook & Automatic Access Integration
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- =========================================================================

-- 1. Buat tabel access_codes jika belum ada
CREATE TABLE IF NOT EXISTS public.access_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'paid' CHECK (type IN ('trial', 'paid', 'partner')),
  duration_days INT DEFAULT 365,
  max_uses INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'revoked')),
  used_by_email TEXT,
  used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON public.access_codes(status);
CREATE INDEX IF NOT EXISTS idx_access_codes_used_by_email ON public.access_codes (LOWER(used_by_email));
CREATE INDEX IF NOT EXISTS idx_access_codes_used_by_user_id ON public.access_codes (used_by_user_id);

-- Aktifkan RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Policy RLS
DROP POLICY IF EXISTS "Admins have full access to access_codes" ON public.access_codes;
CREATE POLICY "Admins have full access to access_codes"
  ON public.access_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
    OR (auth.jwt() ->> 'email') = 'agung5s7@gmail.com'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
    OR (auth.jwt() ->> 'email') = 'agung5s7@gmail.com'
  );

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
  v_trial_expires TIMESTAMPTZ;
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

  -- 4. Akun dengan lisensi berbayar permanen (Paid / Lynk.id)
  IF FOUND AND v_profile.has_access = TRUE AND v_profile.access_type = 'paid' THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'paid');
  END IF;

  -- 5. Akun dengan tipe trial: WAJIB Cek Kedaluwarsa
  IF FOUND AND v_profile.access_type = 'trial' THEN
    v_trial_expires := v_profile.trial_expires_at;

    IF v_trial_expires IS NULL THEN
      SELECT * INTO v_matched_code
      FROM public.access_codes
      WHERE (used_by_user_id = v_uid OR LOWER(used_by_email) = v_email)
        AND type = 'trial'
      ORDER BY used_at DESC NULLS LAST, created_at DESC
      LIMIT 1;

      IF FOUND AND v_matched_code.used_at IS NOT NULL THEN
        v_trial_expires := v_matched_code.used_at + (COALESCE(v_matched_code.duration_days, 14) || ' days')::INTERVAL;
      ELSIF FOUND THEN
        v_trial_expires := v_matched_code.created_at + (COALESCE(v_matched_code.duration_days, 14) || ' days')::INTERVAL;
      ELSE
        v_trial_expires := v_profile.created_at + INTERVAL '1 day';
      END IF;
    END IF;

    IF NOW() >= v_trial_expires THEN
      UPDATE public.profiles SET has_access = FALSE, trial_expires_at = v_trial_expires WHERE id = v_uid;
      UPDATE public.access_codes SET status = 'expired'
      WHERE (used_by_user_id = v_uid OR LOWER(used_by_email) = v_email) AND type = 'trial' AND status = 'used';

      RETURN json_build_object(
        'has_access', FALSE, 
        'reason', 'trial_expired', 
        'access_type', 'trial', 
        'expired_at', v_trial_expires
      );
    ELSE
      IF v_profile.has_access = FALSE OR v_profile.trial_expires_at IS NULL THEN
        UPDATE public.profiles SET has_access = TRUE, trial_expires_at = v_trial_expires WHERE id = v_uid;
      END IF;

      RETURN json_build_object(
        'has_access', TRUE, 
        'is_admin', FALSE, 
        'access_type', 'trial', 
        'expires_at', v_trial_expires
      );
    END IF;
  END IF;

  -- 6. Akun yang sudah ditandai has_access = TRUE (bukan trial)
  IF FOUND AND v_profile.has_access = TRUE AND v_profile.access_type IS NOT NULL AND v_profile.access_type NOT IN ('trial') THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', v_profile.access_type);
  END IF;

  -- 7. Cek apakah ada kode akses yang terikat dengan user_id atau email pembeli (dari Lynk.id / Manual)
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
      -- Update binding kode berbayar
      UPDATE public.access_codes 
      SET 
        used_by_user_id = v_uid,
        used_count = GREATEST(used_count, 1),
        status = 'used',
        used_at = COALESCE(used_at, NOW())
      WHERE id = v_matched_code.id;

      INSERT INTO public.profiles (id, has_access, access_type, trial_expires_at)
      VALUES (v_uid, TRUE, 'paid', NULL)
      ON CONFLICT (id) DO UPDATE 
        SET has_access = TRUE, 
            access_type = 'paid',
            trial_expires_at = NULL;

      RETURN json_build_object(
        'has_access', TRUE, 
        'is_admin', FALSE, 
        'access_type', 'paid',
        'code', v_matched_code.code
      );
    END IF;
  END IF;

  -- 8. Akun lama (legacy) yang mendaftar sebelum lisensi dan TIDAK PERNAH pakai trial
  IF FOUND 
     AND (v_profile.partner_1_name IS NOT NULL OR v_profile.wedding_date IS NOT NULL)
     AND (v_profile.access_type IS NULL OR v_profile.access_type = 'legacy')
     AND NOT EXISTS (
       SELECT 1 FROM public.access_codes 
       WHERE used_by_user_id = v_uid OR LOWER(used_by_email) = v_email
     ) 
  THEN
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
