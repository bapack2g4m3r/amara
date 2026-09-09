-- ==============================================================================
-- Migration Patch: Explicit Groom (CPP) & Bride (CPW) Names
-- ==============================================================================
-- Jalankan skrip ini di Supabase SQL Editor jika belum menjalankan migrasi ini.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS groom_name TEXT,
ADD COLUMN IF NOT EXISTS bride_name TEXT;
