-- Supabase Schema for AMARA Wedding Dashboard

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  partner_1_name TEXT,
  partner_2_name TEXT,
  wedding_date DATE,
  wedding_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks Table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Budget & Expenses Table
CREATE TABLE public.budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total_fund NUMERIC NOT NULL DEFAULT 0,
  honeymoon_target NUMERIC DEFAULT 0,
  honeymoon_collected NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  type TEXT CHECK (type IN ('expense', 'income')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vendors Table
CREATE TABLE public.vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rating NUMERIC,
  price NUMERIC,
  status TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Guests Table
CREATE TABLE public.guests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  category TEXT CHECK (category IN ('Family', 'Friends', 'Corporate', 'VIP Family', 'VIP Friends')),
  pax INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('Pending', 'Confirmed', 'Declined')),
  guest_type TEXT CHECK (guest_type IN ('CPW','CPP','Teman CPW','Teman CPP')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Allow users to only see and edit their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Apply similar policies for other tables (Tasks, Budgets, Expenses, Vendors, Guests)
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- (Repeat for budgets, expenses, vendors, guests)
