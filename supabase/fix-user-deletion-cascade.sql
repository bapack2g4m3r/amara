-- =========================================================================
-- Solusi Menghapus User Supabase (ON DELETE CASCADE)
-- Jalankan skrip ini di SQL Editor Supabase untuk mengizinkan penghapusan
-- user langsung dari menu Authentication -> Users tanpa Foreign Key Error.
-- =========================================================================

-- 1. PROFILES
-- Jika user dihapus di auth.users, hapus profilnya secara otomatis
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Jika owner dihapus, pasangan yang terhubung tidak ikut terhapus, melainkan statusnya diset NULL (mandiri kembali)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_wedding_owner_id_fkey,
  ADD CONSTRAINT profiles_wedding_owner_id_fkey 
    FOREIGN KEY (wedding_owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. TASKS
ALTER TABLE public.tasks 
  DROP CONSTRAINT IF EXISTS tasks_user_id_fkey,
  ADD CONSTRAINT tasks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. BUDGETS
ALTER TABLE public.budgets 
  DROP CONSTRAINT IF EXISTS budgets_user_id_fkey,
  ADD CONSTRAINT budgets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. EXPENSES
ALTER TABLE public.expenses 
  DROP CONSTRAINT IF EXISTS expenses_user_id_fkey,
  ADD CONSTRAINT expenses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. VENDORS
ALTER TABLE public.vendors 
  DROP CONSTRAINT IF EXISTS vendors_user_id_fkey,
  ADD CONSTRAINT vendors_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. GUESTS
ALTER TABLE public.guests 
  DROP CONSTRAINT IF EXISTS guests_user_id_fkey,
  ADD CONSTRAINT guests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
