-- Migration: Add savings_target_date (deadline target dana nikah) to public.budgets
-- Serta memastikan tidak ada duplikasi data budgets per user_id

-- 1. Tambahkan kolom savings_target_date jika belum ada
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS savings_target_date DATE;

-- 2. Bersihkan duplikasi baris budgets jika ada (simpan hanya yang paling baru per user_id)
DELETE FROM public.budgets
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.budgets
  ORDER BY user_id, created_at DESC
);

-- 3. Pasang UNIQUE constraint agar satu user hanya memiliki 1 record budget
CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);

