-- SQL Migration Patch: Fix Fitur Tambah Tamu (Add Guest)
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.

-- 1. Hapus batasan CHECK lama yang menghalangi input data tamu
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_category_check;
ALTER TABLE public.guests DROP CONSTRAINT IF EXISTS guests_guest_type_check;

-- 2. Atur nilai default kolom status agar secara otomatis terisi 'Pending' jika kosong
ALTER TABLE public.guests ALTER COLUMN status SET DEFAULT 'Pending';
