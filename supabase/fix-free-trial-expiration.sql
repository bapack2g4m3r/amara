-- =========================================================================
-- Supabase Migration: Fix Free Trial Expiration & Strict Gatekeeper
-- Mengatasi bug Free Trial yang tidak pernah kedaluwarsa:
-- 1. Menambahkan kolom trial_expires_at pada profiles
-- 2. Memperbaiki fungsi claim_access_code agar menghitung trial_expires_at
-- 3. Memperbaiki fungsi check_user_access() agar memverifikasi batas trial
--    dan mencegah akun trial membypass gatekeeper via aturan legacy
-- 4. Memperbarui admin_get_all_users() agar menampilkan status kedaluwarsa
-- 5. Menandai kode trial lama yang sudah lewat batas waktu menjadi 'expired'
-- =========================================================================

-- 1. Tambahkan kolom trial_expires_at pada tabel profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;

-- 2. Sinkronkan trial_expires_at untuk akun yang pernah mengklaim kode trial sebelumnya
UPDATE public.profiles p
SET 
  trial_expires_at = ac.used_at + (COALESCE(ac.duration_days, 14) || ' days')::INTERVAL
FROM public.access_codes ac
JOIN auth.users u ON (ac.used_by_user_id = u.id OR LOWER(ac.used_by_email) = LOWER(u.email))
WHERE p.id = u.id
  AND ac.type = 'trial'
  AND ac.used_at IS NOT NULL
  AND p.trial_expires_at IS NULL;

-- 3. Kunci akun trial yang masa berlakunya sudah berakhir saat ini (termasuk agung5s7@sekolahmutiarabunda.com)
UPDATE public.profiles p
SET 
  has_access = FALSE
WHERE p.access_type = 'trial'
  AND (
    (p.trial_expires_at IS NOT NULL AND p.trial_expires_at < NOW())
    OR (p.trial_expires_at IS NULL AND p.created_at + INTERVAL '1 day' < NOW())
  );

-- 4. Tandai kode akses trial yang sudah terpakai dan masa aktifnya habis menjadi status 'expired'
UPDATE public.access_codes
SET status = 'expired'
WHERE type = 'trial'
  AND status = 'used'
  AND used_at IS NOT NULL
  AND (used_at + (COALESCE(duration_days, 14) || ' days')::INTERVAL) < NOW();

-- 5. Perbarui fungsi claim_access_code agar otomatis mengisi trial_expires_at
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

  -- Update status pemakaian kode akses
  UPDATE public.access_codes
  SET 
    used_count = used_count + 1,
    status = CASE WHEN used_count + 1 >= max_uses THEN 'used' ELSE 'active' END,
    used_by_email = LOWER(TRIM(p_email)),
    used_by_user_id = v_target_user_id,
    used_at = NOW()
  WHERE id = v_rec.id;

  -- Beri hak akses ke profil pengguna dengan trial_expires_at yang presisi
  IF v_target_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, has_access, access_type, trial_expires_at)
    VALUES (v_target_user_id, TRUE, v_rec.type, v_trial_expires)
    ON CONFLICT (id) DO UPDATE 
      SET has_access = TRUE, 
          access_type = v_rec.type,
          trial_expires_at = v_trial_expires;
  END IF;

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

-- 6. Perbaiki fungsi check_user_access() agar memvalidasi batas trial dan mencegah bypass legacy
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

  -- 2. Akun dengan flag is_admin = TRUE
  IF FOUND AND v_profile.is_admin = TRUE THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', TRUE, 'access_type', 'admin');
  END IF;

  -- 3. Pasangan yang diundang (kolaborasi)
  IF FOUND AND v_profile.wedding_owner_id IS NOT NULL THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'partner');
  END IF;

  -- 4. Akun dengan Lisensi Berbayar (Permanen / Lynk.id)
  IF FOUND AND v_profile.has_access = TRUE AND v_profile.access_type = 'paid' THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'paid');
  END IF;

  -- 5. Akun dengan Tipe Free Trial: WAJIB Cek Kedaluwarsa
  IF FOUND AND v_profile.access_type = 'trial' THEN
    v_trial_expires := v_profile.trial_expires_at;

    -- Jika kolom trial_expires_at di profil belum terisi, cari dari riwayat access_codes
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
        -- Fallback default jika tidak ada kode sama sekali
        v_trial_expires := v_profile.created_at + INTERVAL '1 day';
      END IF;
    END IF;

    -- Evaluasi apakah masa trial sudah habis
    IF NOW() >= v_trial_expires THEN
      -- Trial SUDAH HABIS: Kunci akses pengguna di profil dan update kode
      UPDATE public.profiles 
      SET has_access = FALSE, trial_expires_at = v_trial_expires 
      WHERE id = v_uid;

      UPDATE public.access_codes 
      SET status = 'expired'
      WHERE (used_by_user_id = v_uid OR LOWER(used_by_email) = v_email)
        AND type = 'trial'
        AND status = 'used';

      RETURN json_build_object(
        'has_access', FALSE, 
        'reason', 'trial_expired', 
        'access_type', 'trial', 
        'expired_at', v_trial_expires
      );
    ELSE
      -- Trial MASIH AKTIF: Perbarui has_access & trial_expires_at jika belum sinkron
      IF v_profile.has_access = FALSE OR v_profile.trial_expires_at IS NULL THEN
        UPDATE public.profiles 
        SET has_access = TRUE, trial_expires_at = v_trial_expires 
        WHERE id = v_uid;
      END IF;

      RETURN json_build_object(
        'has_access', TRUE, 
        'is_admin', FALSE, 
        'access_type', 'trial', 
        'expires_at', v_trial_expires
      );
    END IF;
  END IF;

  -- 6. Akun yang memiliki has_access = TRUE (lisensi khusus / langsung dari admin)
  IF FOUND AND v_profile.has_access = TRUE AND v_profile.access_type IS NOT NULL AND v_profile.access_type NOT IN ('trial') THEN
    RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', v_profile.access_type);
  END IF;

  -- 7. Cek apakah ada kode akses aktif di tabel access_codes (misal baru dibeli via Lynk.id)
  SELECT * INTO v_matched_code 
  FROM public.access_codes 
  WHERE (used_by_user_id = v_uid OR LOWER(used_by_email) = v_email)
    AND status IN ('active', 'used')
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Jika kode yang ditemukan bertipe trial
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
      -- Jika kode bertipe paid (permanen)
      UPDATE public.access_codes 
      SET used_by_user_id = v_uid, used_count = GREATEST(used_count, 1), status = 'used', used_at = COALESCE(used_at, NOW())
      WHERE id = v_matched_code.id;

      INSERT INTO public.profiles (id, has_access, access_type, trial_expires_at)
      VALUES (v_uid, TRUE, 'paid', NULL)
      ON CONFLICT (id) DO UPDATE SET has_access = TRUE, access_type = 'paid', trial_expires_at = NULL;

      RETURN json_build_object('has_access', TRUE, 'is_admin', FALSE, 'access_type', 'paid', 'code', v_matched_code.code);
    END IF;
  END IF;

  -- 8. Akun Lama (Legacy): HANYA BERLAKU untuk pengguna yang mendaftar sebelum sistem lisensi
  --    dan TIDAK PERNAH memiliki kode trial / berstatus trial sama sekali!
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

  -- 9. Akses ditolak: Belum memiliki lisensi aktif
  RETURN json_build_object('has_access', FALSE, 'reason', 'no_license');
END;
$$;

-- 7. Perbarui admin_get_all_users() agar menyertakan status kedaluwarsa trial
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
      -- has_access dinamis: jika trial sudah lewat waktu, anggap false
      CASE 
        WHEN COALESCE(p.is_admin, FALSE) OR u.email = 'agung5s7@gmail.com' THEN TRUE
        WHEN p.wedding_owner_id IS NOT NULL THEN TRUE
        WHEN p.access_type = 'paid' THEN TRUE
        WHEN p.access_type = 'trial' AND p.trial_expires_at IS NOT NULL AND p.trial_expires_at < NOW() THEN FALSE
        ELSE COALESCE(p.has_access, FALSE)
      END AS has_access,
      p.access_type,
      p.trial_expires_at,
      -- Flag kedaluwarsa
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
    LEFT JOIN public.profiles owner_p ON owner_p.id = p.wedding_owner_id
    ORDER BY u.created_at DESC
  ) u_data;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 8. Perbarui fungsi admin_grant_direct_access agar mengatur trial_expires_at bila diberikan trial
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
  v_caller_email TEXT := auth.jwt() ->> 'email';
  v_is_admin BOOLEAN := FALSE;
  v_target_email TEXT;
  v_trial_expires TIMESTAMPTZ := NULL;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  IF NOT (COALESCE(v_is_admin, FALSE) OR v_caller_email = 'agung5s7@gmail.com') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Superadmin yang diizinkan.';
  END IF;

  SELECT email INTO v_target_email FROM auth.users WHERE id = p_target_user_id;

  IF p_access_type = 'trial' THEN
    v_trial_expires := NOW() + INTERVAL '14 days';
  END IF;

  INSERT INTO public.profiles (id, has_access, access_type, trial_expires_at)
  VALUES (p_target_user_id, TRUE, p_access_type, v_trial_expires)
  ON CONFLICT (id) DO UPDATE 
    SET has_access = TRUE, 
        access_type = p_access_type,
        trial_expires_at = v_trial_expires;

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Akses ' || UPPER(p_access_type) || ' berhasil diberikan kepada ' || COALESCE(v_target_email, '')
  );
END;
$$;

-- 9. Pastikan permission eksekusi tetap aman
GRANT EXECUTE ON FUNCTION public.check_user_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_access_code(TEXT, TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_direct_access(UUID, TEXT) TO authenticated;
