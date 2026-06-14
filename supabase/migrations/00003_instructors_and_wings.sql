-- 00003_instructors_and_wings.sql

-- 1. Remove 'role' from cadet_profiles since we are separating tables
ALTER TABLE public.cadet_profiles DROP COLUMN IF EXISTS role;

-- 2. Create instructor_profiles
CREATE TABLE public.instructor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  unit TEXT,
  rank TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for instructors
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public instructor profiles are viewable by everyone."
  ON public.instructor_profiles FOR SELECT
  USING ( true );

CREATE POLICY "Instructors can update own profile."
  ON public.instructor_profiles FOR UPDATE
  USING ( auth.uid() = id );


-- 3. Create admin_profiles
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for admins
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public admin profiles are viewable by everyone."
  ON public.admin_profiles FOR SELECT
  USING ( true );

CREATE POLICY "Admins can update own profile."
  ON public.admin_profiles FOR UPDATE
  USING ( auth.uid() = id );


-- 4. Add target_wing to courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS target_wing VARCHAR(50) DEFAULT 'Common' 
CHECK (target_wing IN ('Common', 'Army', 'Navy', 'Air Force'));

-- 5. Add created_at to chapters if missing (just in case), already there from 00002.
