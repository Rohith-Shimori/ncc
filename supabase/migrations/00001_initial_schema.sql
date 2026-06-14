-- 00001_initial_schema.sql
-- Drop tables if they exist (for safe re-runs during development)
DROP TABLE IF EXISTS public.cadet_profiles CASCADE;

-- Create cadet_profiles
CREATE TABLE public.cadet_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  ncc_number TEXT UNIQUE,
  wing TEXT CHECK (wing IN ('Army', 'Navy', 'Air Force')),
  certificate_level TEXT CHECK (certificate_level IN ('A', 'B', 'C')),
  role TEXT DEFAULT 'cadet' CHECK (role IN ('cadet', 'instructor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cadet_profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.cadet_profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.cadet_profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.cadet_profiles FOR UPDATE
  USING ( auth.uid() = id );
