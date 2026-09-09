-- ==============================================================================
-- Migration Patch: Vendor Contacts & Task PIC
-- ==============================================================================
-- Jalankan skrip ini di Supabase SQL Editor jika belum menjalankan migrasi ini.

-- 1. Tambahkan kolom pic pada tabel tasks (Bersama, CPP, CPW)
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS pic TEXT DEFAULT 'Bersama';

-- 2. Tambahkan kolom kontak pada tabel vendors
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS contact_name TEXT;

ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;
