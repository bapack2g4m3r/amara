-- =========================================================================
-- Supabase Migration: Access Codes & Admin Panel (Free Trial & Lynk.id)
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- =========================================================================

-- 1. Tambahkan kolom is_admin pada profiles (jika belum ada)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Buat tabel access_codes
CREATE TABLE IF NOT EXISTS public.access_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'trial' CHECK (type IN ('trial', 'paid')),
  duration_days INT DEFAULT 14,
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

-- Index untuk kecepatan pencarian
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON public.access_codes(status);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya Superadmin yang bisa melihat, menambah, mengubah, atau menghapus kode
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

-- 4. Fungsi Validasi Kode Akses (Bisa dipanggil oleh calon pengguna sebelum/saat mendaftar)
CREATE OR REPLACE FUNCTION public.validate_access_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec RECORD;
  v_clean_code TEXT := UPPER(TRIM(p_code));
BEGIN
  IF v_clean_code IS NULL OR v_clean_code = '' THEN
    RETURN json_build_object(
      'is_valid', FALSE,
      'message', 'Kode akses tidak boleh kosong'
    );
  END IF;

  SELECT * INTO v_rec 
  FROM public.access_codes 
  WHERE UPPER(code) = v_clean_code 
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'is_valid', FALSE,
      'message', 'Kode akses tidak ditemukan atau salah'
    );
  END IF;

  IF v_rec.status = 'revoked' THEN
    RETURN json_build_object(
      'is_valid', FALSE,
      'message', 'Kode akses ini telah dinonaktifkan oleh administrator'
    );
  END IF;

  IF v_rec.status = 'used' OR v_rec.used_count >= v_rec.max_uses THEN
    RETURN json_build_object(
      'is_valid', FALSE,
      'message', 'Kode akses ini sudah terpakai dan tidak dapat digunakan lagi'
    );
  END IF;

  IF v_rec.expires_at IS NOT NULL AND v_rec.expires_at < NOW() THEN
    RETURN json_build_object(
      'is_valid', FALSE,
      'message', 'Kode akses ini telah kedaluwarsa'
    );
  END IF;

  RETURN json_build_object(
    'is_valid', TRUE,
    'code', v_rec.code,
    'type', v_rec.type,
    'duration_days', v_rec.duration_days,
    'note', v_rec.note,
    'message', 'Kode akses valid'
  );
END;
$$;

-- 5. Fungsi Klaim Kode Akses (Atomic & Aman)
CREATE OR REPLACE FUNCTION public.claim_access_code(
  p_code TEXT, 
  p_email TEXT, 
  p_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses telah dinonaktifkan');
  END IF;

  IF v_rec.status = 'used' OR v_rec.used_count >= v_rec.max_uses THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses sudah terpakai');
  END IF;

  IF v_rec.expires_at IS NOT NULL AND v_rec.expires_at < NOW() THEN
    RETURN json_build_object('success', FALSE, 'message', 'Kode akses kedaluwarsa');
  END IF;

  -- Update pemakaian
  UPDATE public.access_codes
  SET 
    used_count = used_count + 1,
    status = CASE WHEN used_count + 1 >= max_uses THEN 'used' ELSE 'active' END,
    used_by_email = TRIM(p_email),
    used_by_user_id = v_target_user_id,
    used_at = NOW()
  WHERE id = v_rec.id;

  RETURN json_build_object(
    'success', TRUE,
    'code', v_rec.code,
    'type', v_rec.type,
    'duration_days', v_rec.duration_days,
    'message', 'Kode akses berhasil diklaim'
  );
END;
$$;

-- Grant hak eksekusi ke anon & authenticated untuk fungsi validasi dan klaim
GRANT EXECUTE ON FUNCTION public.validate_access_code(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_access_code(TEXT, TEXT, UUID) TO anon, authenticated;

-- =========================================================================
-- CARA MENGANGKAT AKUN ANDA MENJADI SUPERADMIN AMARA:
-- Jalankan query berikut (akan otomatis membuat / mengupdate baris profiles):
-- 
-- INSERT INTO public.profiles (id, is_admin)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'agung5s7@gmail.com'),
--   TRUE
-- )
-- ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;
-- =========================================================================
