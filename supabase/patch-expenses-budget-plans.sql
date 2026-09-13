-- ==============================================================================
-- Migration Patch: Expenses Budget Plans, Vendor Name & Deadlines
-- ==============================================================================
-- Jalankan skrip ini di Supabase SQL Editor jika fitur tambah tabel/kategori/plan
-- di sub page budgeting & pembayaran belum tersimpan ke Supabase live.

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'plan_a',
ADD COLUMN IF NOT EXISTS planned_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS vendor_name TEXT,
ADD COLUMN IF NOT EXISTS deadline DATE;

-- Pastikan kolom amount memiliki default 0 agar insert tanpa amount eksplisit tidak gagal
ALTER TABLE public.expenses 
ALTER COLUMN amount SET DEFAULT 0;

-- Refresh schema cache Supabase
NOTIFY pgrst, 'reload config';
