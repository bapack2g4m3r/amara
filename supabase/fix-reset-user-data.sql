-- =========================================================================
-- Supabase Migration: Full Wedding Data Reset (Atomic & Clean)
-- Menghapus seluruh data pernikahan user secara bersih dan permanen
-- Jalankan skrip ini di SQL Editor Supabase untuk mengaktifkan reset atomic
-- =========================================================================

CREATE OR REPLACE FUNCTION public.reset_user_wedding_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_owner_id UUID;
  v_target_id UUID;
  v_partner_ids UUID[];
  v_all_uids UUID[];
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: User belum login');
  END IF;

  -- 1. Deteksi apakah user adalah partner yang terhubung ke owner
  SELECT wedding_owner_id INTO v_owner_id FROM public.profiles WHERE id = v_uid;
  
  IF v_owner_id IS NOT NULL THEN
    v_target_id := v_owner_id;
  ELSE
    v_target_id := v_uid;
  END IF;

  -- 2. Kumpulkan semua User ID yang terkait (Owner, Partner pemanggil, atau Partner yang terhubung ke Owner)
  SELECT array_agg(id) INTO v_partner_ids 
  FROM public.profiles 
  WHERE wedding_owner_id = v_target_id OR id = v_target_id OR id = v_uid;

  v_all_uids := ARRAY[v_target_id, v_uid];
  IF v_partner_ids IS NOT NULL THEN
    v_all_uids := ARRAY(SELECT DISTINCT unnest(v_all_uids || v_partner_ids));
  END IF;

  -- 3. Hapus seluruh data dari semua tabel pernikahan
  DELETE FROM public.tasks WHERE user_id = ANY(v_all_uids);
  DELETE FROM public.expenses WHERE user_id = ANY(v_all_uids);
  DELETE FROM public.budgets WHERE user_id = ANY(v_all_uids);
  DELETE FROM public.vendors WHERE user_id = ANY(v_all_uids);
  DELETE FROM public.guests WHERE user_id = ANY(v_all_uids);
  DELETE FROM public.savings WHERE user_id = ANY(v_all_uids);
  DELETE FROM public.seserahan WHERE user_id = ANY(v_all_uids);
  DELETE FROM public.budget_plans WHERE user_id = ANY(v_all_uids);

  -- 4. Reset Profil (Hapus nama CPP/CPW, tanggal, lokasi, foto, status kolaborasi)
  -- Catatan: has_access, access_type, dan is_admin TETAP DIPERTAHANKAN agar lisensi pembelian tidak hilang!
  UPDATE public.profiles 
  SET partner_1_name = NULL,
      partner_2_name = NULL,
      groom_name = NULL,
      bride_name = NULL,
      wedding_date = NULL,
      wedding_location = NULL,
      avatar_url = NULL,
      wedding_owner_id = NULL,
      partner_role = NULL,
      partner_email = NULL,
      partner_name = NULL,
      invite_code = NULL,
      is_collaborating = FALSE,
      updated_at = NOW()
  WHERE id = ANY(v_all_uids);

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Seluruh data profil dan pernikahan berhasil dibersihkan secara permanen',
    'affected_uids', v_all_uids
  );
END;
$$;

-- Berikan izin akses eksekusi ke authenticated user
GRANT EXECUTE ON FUNCTION public.reset_user_wedding_data() TO authenticated;
