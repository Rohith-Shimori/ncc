-- 00004_complete_schema.sql
-- Question banks, tests, results, announcements, enrollments

CREATE TABLE IF NOT EXISTS public.question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES public.question_banks(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic_tag VARCHAR(100),
  explanation TEXT,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  test_type VARCHAR(20) DEFAULT 'practice' CHECK (test_type IN ('practice', 'mock', 'final')),
  duration_minutes INTEGER DEFAULT 30,
  question_count INTEGER DEFAULT 10,
  passing_score INTEGER DEFAULT 60,
  randomize_questions BOOLEAN DEFAULT true,
  target_wing VARCHAR(50) DEFAULT 'Common',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score INTEGER,
  total_correct INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress',
  tab_switch_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  question_ids JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer TEXT,
  is_correct BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(10) DEFAULT 'normal',
  target_wing VARCHAR(50) DEFAULT 'Common',
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'enrolled',
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "qb_select" ON public.question_banks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "q_select" ON public.questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "tests_select" ON public.tests FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
CREATE POLICY "attempts_select_own" ON public.test_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attempts_insert_own" ON public.test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "attempts_update_own" ON public.test_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "answers_select_own" ON public.test_answers FOR SELECT USING (attempt_id IN (SELECT id FROM public.test_attempts WHERE user_id = auth.uid()));
CREATE POLICY "answers_insert_own" ON public.test_answers FOR INSERT WITH CHECK (attempt_id IN (SELECT id FROM public.test_attempts WHERE user_id = auth.uid()));
CREATE POLICY "ann_select" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "enroll_select_own" ON public.course_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "enroll_insert_own" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "enroll_update_own" ON public.course_enrollments FOR UPDATE USING (auth.uid() = user_id);
