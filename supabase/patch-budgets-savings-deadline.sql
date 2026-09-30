-- Migration: Add savings_target_date (deadline target dana nikah) to public.budgets
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS savings_target_date DATE;
