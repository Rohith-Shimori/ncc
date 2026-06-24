-- NCC Database Migration 00045
-- Redefines fn_get_users_by_wing to return full_name and creates the push_subscriptions table.

-- 1. Redefine fn_get_users_by_wing to include full_name (required by announcement email templates)
DROP FUNCTION IF EXISTS public.fn_get_users_by_wing(text);
CREATE OR REPLACE FUNCTION public.fn_get_users_by_wing(p_wing text)
RETURNS TABLE(id uuid, full_name text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.full_name, u.email
  FROM public.cadet_profiles c
  JOIN auth.users u ON c.id = u.id
  WHERE p_wing = 'Common' OR c.wing = p_wing;
$$;

-- 2. Create push_subscriptions table (required for Web Push notifications)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own push subscriptions."
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions."
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions."
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger CD pipeline with migration history repair
