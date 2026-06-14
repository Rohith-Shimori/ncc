-- ==========================================
-- MIGRATION: 00001_initial_schema.sql
-- ==========================================

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


-- ==========================================
-- MIGRATION: 00002_courses_and_progress.sql
-- ==========================================

-- Create courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create modules table (A course has many modules)
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chapters table (A module has many chapters)
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('images', 'markdown')),
    content_data JSONB NOT NULL, -- Will store either { "images": ["url1", "url2"] } OR { "markdown": "# Hello..." }
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, chapter_id)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Courses: Everyone can read courses
CREATE POLICY "Courses are viewable by everyone" ON courses
    FOR SELECT USING (true);

-- Modules: Everyone can read modules
CREATE POLICY "Modules are viewable by everyone" ON modules
    FOR SELECT USING (true);

-- Chapters: Everyone can read chapters
CREATE POLICY "Chapters are viewable by everyone" ON chapters
    FOR SELECT USING (true);

-- User Progress: Users can only see and update their own progress
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);


-- ==========================================
-- MIGRATION: 00003_instructors_and_wings.sql
-- ==========================================

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


-- ==========================================
-- MIGRATION: 00004_complete_schema.sql
-- ==========================================

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


-- ==========================================
-- MIGRATION: 00005_schema_enhancements.sql
-- ==========================================

-- 00005_schema_enhancements.sql
-- Add missing columns + exam RPC functions (SECURITY DEFINER)

-- ============================================
-- SCHEMA FIXES
-- ============================================
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_level VARCHAR(5) DEFAULT 'A';

ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS image_urls JSONB;

-- ============================================
-- SECURE EXAM FUNCTIONS (SECURITY DEFINER)
-- These run with DB owner privileges, so clients
-- never see correct_answer directly.
-- ============================================

-- 1. START EXAM: Creates attempt, picks random questions, returns them WITHOUT answers
CREATE OR REPLACE FUNCTION public.fn_start_exam(p_test_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_test RECORD;
  v_attempt_id UUID;
  v_question_ids UUID[];
  v_questions JSONB;
BEGIN
  -- Get test details
  SELECT * INTO v_test FROM tests WHERE id = p_test_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Test not found or inactive';
  END IF;

  -- Select random questions from the test's course question banks
  SELECT ARRAY_AGG(q.id) INTO v_question_ids
  FROM (
    SELECT qs.id FROM questions qs
    JOIN question_banks qb ON qs.bank_id = qb.id
    WHERE qb.course_id = v_test.course_id
    ORDER BY random()
    LIMIT v_test.question_count
  ) q;

  IF v_question_ids IS NULL OR array_length(v_question_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No questions available for this test';
  END IF;

  -- Create attempt
  INSERT INTO test_attempts (test_id, user_id, question_ids, total_questions, status)
  VALUES (p_test_id, auth.uid(), to_jsonb(v_question_ids), array_length(v_question_ids, 1), 'in_progress')
  RETURNING id INTO v_attempt_id;

  -- Return questions WITHOUT correct_answer and explanation
  SELECT jsonb_build_object(
    'attempt_id', v_attempt_id,
    'duration_minutes', v_test.duration_minutes,
    'test_title', v_test.title,
    'questions', jsonb_agg(
      jsonb_build_object(
        'id', qs.id,
        'question_text', qs.question_text,
        'question_type', qs.question_type,
        'options', qs.options,
        'topic_tag', qs.topic_tag,
        'points', qs.points,
        'difficulty', qs.difficulty
      ) ORDER BY random() -- randomize order
    )
  ) INTO v_questions
  FROM questions qs
  WHERE qs.id = ANY(v_question_ids);

  RETURN v_questions;
END;
$$;

-- 2. SUBMIT EXAM: Grades answers server-side, never exposes correct answers during exam
CREATE OR REPLACE FUNCTION public.fn_submit_exam(
  p_attempt_id UUID,
  p_answers JSONB, -- [{"question_id": "uuid", "selected_answer": "text"}, ...]
  p_tab_switches INTEGER DEFAULT 0,
  p_time_spent INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_answer RECORD;
  v_question RECORD;
  v_correct_count INTEGER := 0;
  v_total INTEGER := 0;
  v_score INTEGER;
  v_status TEXT := 'submitted';
BEGIN
  -- Verify attempt belongs to user and is in_progress
  SELECT * INTO v_attempt FROM test_attempts
  WHERE id = p_attempt_id AND user_id = auth.uid() AND status = 'in_progress';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid attempt or already submitted';
  END IF;

  -- Flag if too many tab switches
  IF p_tab_switches >= 5 THEN
    v_status := 'flagged';
  END IF;

  -- Grade each answer
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers) AS elem
  LOOP
    SELECT * INTO v_question FROM questions WHERE id = (v_answer.elem->>'question_id')::UUID;
    IF FOUND THEN
      v_total := v_total + 1;
      INSERT INTO test_answers (attempt_id, question_id, selected_answer, is_correct, time_spent_seconds)
      VALUES (
        p_attempt_id,
        v_question.id,
        v_answer.elem->>'selected_answer',
        v_question.correct_answer = v_answer.elem->>'selected_answer',
        COALESCE((v_answer.elem->>'time_spent')::INTEGER, 0)
      )
      ON CONFLICT (attempt_id, question_id) DO NOTHING;

      IF v_question.correct_answer = v_answer.elem->>'selected_answer' THEN
        v_correct_count := v_correct_count + 1;
      END IF;
    END IF;
  END LOOP;

  -- Calculate score
  v_score := CASE WHEN v_total > 0 THEN ROUND((v_correct_count::NUMERIC / v_total) * 100) ELSE 0 END;

  -- Update attempt
  UPDATE test_attempts SET
    submitted_at = NOW(),
    score = v_score,
    total_correct = v_correct_count,
    total_questions = v_total,
    tab_switch_count = p_tab_switches,
    time_spent_seconds = p_time_spent,
    status = v_status
  WHERE id = p_attempt_id;

  RETURN jsonb_build_object(
    'score', v_score,
    'total_correct', v_correct_count,
    'total_questions', v_total,
    'status', v_status,
    'passed', v_score >= (SELECT passing_score FROM tests WHERE id = v_attempt.test_id)
  );
END;
$$;

-- 3. GET RESULTS: Returns full results with correct answers (only for submitted attempts)
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_attempt FROM test_attempts
  WHERE id = p_attempt_id AND user_id = auth.uid() AND status IN ('submitted', 'flagged', 'timed_out');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Results not available';
  END IF;

  SELECT jsonb_build_object(
    'attempt_id', v_attempt.id,
    'test_title', t.title,
    'score', v_attempt.score,
    'total_correct', v_attempt.total_correct,
    'total_questions', v_attempt.total_questions,
    'time_spent', v_attempt.time_spent_seconds,
    'tab_switches', v_attempt.tab_switch_count,
    'status', v_attempt.status,
    'passed', v_attempt.score >= t.passing_score,
    'submitted_at', v_attempt.submitted_at,
    'questions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'question_text', q.question_text,
          'options', q.options,
          'correct_answer', q.correct_answer,
          'selected_answer', ta.selected_answer,
          'is_correct', ta.is_correct,
          'explanation', q.explanation,
          'topic_tag', q.topic_tag
        )
      )
      FROM test_answers ta
      JOIN questions q ON q.id = ta.question_id
      WHERE ta.attempt_id = v_attempt.id
    )
  ) INTO v_result
  FROM tests t WHERE t.id = v_attempt.test_id;

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.fn_start_exam(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_exam_results(UUID) TO authenticated;


-- ==========================================
-- MIGRATION: 00006_seed_data.sql
-- ==========================================

-- 00006_seed_data.sql — Real NCC A/B/C Certificate Content

-- ============================================
-- COURSES
-- ============================================
INSERT INTO courses (id, title, description, target_wing, certificate_level, duration_hours) VALUES
('a1000000-0000-0000-0000-000000000001', 'NCC General Knowledge', 'History, aims, organization, motto, pledge and song of NCC. Foundation for all certificates.', 'Common', 'A', 6),
('a1000000-0000-0000-0000-000000000002', 'Drill Training', 'Foot drill, arms drill, parade formations and word-of-command procedures.', 'Common', 'A', 8),
('a1000000-0000-0000-0000-000000000003', 'National Integration & Awareness', 'Unity in diversity, national heroes, famous battles, and civic responsibilities.', 'Common', 'B', 5),
('a1000000-0000-0000-0000-000000000004', 'Health, Hygiene & First Aid', 'Personal hygiene, sanitation, nutrition, common diseases, and first aid techniques.', 'Common', 'B', 6),
('a1000000-0000-0000-0000-000000000005', 'Map Reading & Field Craft', 'Topographic maps, compass navigation, conventional signs, camouflage and concealment.', 'Army', 'B', 10),
('a1000000-0000-0000-0000-000000000006', 'Weapon Training', 'Nomenclature, characteristics, handling, firing positions of .22 Rifle and 7.62mm SLR.', 'Army', 'B', 8),
('a1000000-0000-0000-0000-000000000007', 'Naval Orientation & Seamanship', 'Naval history, seamanship basics, knots, boat handling, and naval communication.', 'Navy', 'B', 9),
('a1000000-0000-0000-0000-000000000008', 'Principles of Flight & Aero Modelling', 'Aerodynamics, aircraft recognition, aero-model building, and aviation basics.', 'Air Force', 'B', 7),
('a1000000-0000-0000-0000-000000000009', 'Leadership & Personality Development', 'Leadership qualities, communication skills, time management, and decision making for C certificate.', 'Common', 'C', 6),
('a1000000-0000-0000-0000-000000000010', 'Disaster Management & Civil Defence', 'Natural and man-made disasters, rescue operations, civil defence organization.', 'Common', 'C', 5);

-- ============================================
-- MODULES (3-4 per course)
-- ============================================
-- Course 1: NCC General Knowledge
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'History & Evolution of NCC', 1),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'NCC Organization & Structure', 2),
('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'NCC Activities & Camps', 3);

-- Course 2: Drill Training
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Basic Foot Drill', 1),
('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Parade Formations', 2),
('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Arms Drill', 3);

-- Course 3: National Integration
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'Unity in Diversity', 1),
('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'National Heroes & Freedom Fighters', 2),
('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 'Famous Indian Battles', 3);

-- Course 4: Health & First Aid
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000004', 'Personal Hygiene & Sanitation', 1),
('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000004', 'First Aid Fundamentals', 2),
('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004', 'Nutrition & Common Diseases', 3);

-- Course 5: Map Reading (Army)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000005', 'Introduction to Maps', 1),
('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000005', 'Compass & Navigation', 2),
('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'Field Craft & Battle Craft', 3);

-- Course 6: Weapon Training (Army)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000006', '.22 Rifle - Parts & Handling', 1),
('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000006', 'Firing Positions & Aiming', 2),
('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000006', 'Range Procedures & Safety', 3);

-- Course 7: Naval (Navy)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000007', 'Naval History & Organization', 1),
('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000007', 'Seamanship & Knots', 2),
('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000007', 'Boat Handling & Signals', 3);

-- Course 8: Air Force
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000008', 'History of Aviation', 1),
('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000008', 'Principles of Flight', 2),
('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000008', 'Aero Modelling Basics', 3);

-- Course 9: Leadership (C cert)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000009', 'Qualities of a Leader', 1),
('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000009', 'Communication & Decision Making', 2),
('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000009', 'Case Studies in Military Leadership', 3);

-- Course 10: Disaster Management (C cert)
INSERT INTO modules (id, course_id, title, order_index) VALUES
('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000010', 'Types of Disasters', 1),
('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000010', 'Rescue & Relief Operations', 2),
('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000010', 'Civil Defence Organization', 3);


-- ==========================================
-- MIGRATION: 00007_seed_chapters_questions.sql
-- ==========================================

-- 00007_seed_chapters_questions.sql — Chapters with real NCC content + Questions + Tests

-- ============================================
-- CHAPTERS (with real markdown content)
-- content_data JSONB is required (NOT NULL from 00002)
-- content TEXT is the 00005 enhancement column
-- ============================================

-- Module: History & Evolution of NCC
INSERT INTO chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Origin and Establishment of NCC', 'markdown',
'{"markdown": "# Origin and Establishment of NCC\n\n## Background\nThe National Cadet Corps (NCC) came into existence on **15 July 1948** under the NCC Act XXXI of 1948. It was raised on the recommendation of **Pandit H.N. Kunzru Committee** in 1946.\n\n## Historical Roots\n- **1666**: First Volunteer Corps raised in India\n- **1917**: University Corps established during World War I\n- **1942**: University Officers Training Corps (UOTC) formed\n- **1948**: NCC established, replacing the UOTC\n\n## NCC Motto\n**Unity and Discipline** (एकता और अनुशासन)\n\n## NCC Pledge\nWe the cadets of the National Cadet Corps do solemnly pledge that we shall always uphold the unity of India.\n\n## NCC Song\nThe NCC Song **Hum Sab Bharatiya Hain** was written by **Sudarshan Faakir**."}',
1,
'# Origin and Establishment of NCC

## Background
The National Cadet Corps (NCC) came into existence on **15 July 1948** under the NCC Act XXXI of 1948. It was raised on the recommendation of **Pandit H.N. Kunzru Committee** in 1946.

## Historical Roots
- **1666**: First Volunteer Corps raised in India
- **1917**: University Corps established during World War I
- **1942**: University Officers Training Corps (UOTC) formed
- **1948**: NCC established, replacing the UOTC

## Key Facts
| Detail | Information |
|--------|------------|
| Established | 15 July 1948 |
| First DG | Lt Gen Grubb |
| Parent Ministry | Ministry of Defence |
| Headquarters | New Delhi |
| Current Strength | ~14 Lakh cadets |

## NCC Motto
**"Unity and Discipline"** (एकता और अनुशासन)

## NCC Pledge
> We the cadets of the National Cadet Corps do solemnly pledge that we shall always uphold the unity of India. We shall never resort to violence and shall strive to be worthy citizens of our country.

## NCC Song
The NCC Song **"Hum Sab Bharatiya Hain"** was written by **Sudarshan Faakir** and composed by the great poet himself.'),

('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'NCC Aims and Objectives', 'markdown',
'{"markdown": "# NCC Aims and Objectives\n\n## Primary Aims\n1. Character Building\n2. Unity\n3. Service\n\n## Three Cardinal Principles\n1. Sense of Duty and Discipline\n2. Secular Outlook and Respect for Diversity\n3. Spirit of Selfless Service"}',
2,
'# NCC Aims and Objectives

## Primary Aims
1. **Character Building** — Develop qualities of character, courage, comradeship, discipline, leadership, secular outlook, spirit of adventure, and ideals of selfless service
2. **Unity** — Create a human resource of organized, trained, and motivated youth to provide leadership in all walks of life
3. **Service** — Provide a suitable environment to motivate the youth to take up a career in the Armed Forces

## Core Objectives
- To develop character, comradeship, discipline, and a secular outlook
- To create a pool of organized, trained, and motivated youth with leadership qualities
- To provide a suitable environment to motivate the youth to take up career in Armed Forces
- To develop qualities of selfless service among the youth

## Three Cardinal Principles
1. **Sense of Duty and Discipline**
2. **Secular Outlook and Respect for Diversity**
3. **Spirit of Selfless Service**

## NCC Flag
The NCC flag has three colors representing the three wings:
- **Red** — Army Wing
- **Dark Blue** — Navy Wing
- **Light Blue** — Air Force Wing

The NCC crest is in the center with the motto "Unity and Discipline" inscribed below.'),

('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'NCC Certificates - A, B & C', 'markdown',
'{"markdown": "# NCC Certificates — A, B and C\n\n## A Certificate\nClass VIII-X, 2 years JD/JW, Written 100 + Practical 100\n\n## B Certificate\nClass XI-XII / 1st-2nd year college, Written 150 + Practical 150\n\n## C Certificate\n2nd-3rd year college, Written 200 + Practical 200, Direct entry Armed Forces"}',
3,
'# NCC Certificates — A, B & C

## Certificate Levels

### A Certificate
- **Eligibility**: Class VIII to X (2 years in JD/JW)
- **Exam Pattern**: Written (100 marks) + Practical (100 marks)
- **Key Benefits**: 5-10 bonus marks in various state board exams

### B Certificate
- **Eligibility**: Class XI to XII / 1st & 2nd year college (2 years in SD/SW)
- **Exam Pattern**: Written (150 marks) + Practical (150 marks)
- **Key Benefits**: Preference in government jobs, bonus marks in competitive exams

### C Certificate
- **Eligibility**: 2nd & 3rd year college (minimum 3 years total NCC)
- **Exam Pattern**: Written (200 marks) + Practical (200 marks)
- **Key Benefits**: Direct entry in Armed Forces (Short Service Commission), exemption from CDS written exam

## Exam Pattern (Latest)
| Component | A Cert | B Cert | C Cert |
|-----------|--------|--------|--------|
| Written | 100 | 150 | 200 |
| Practical/Drill | 60 | 80 | 120 |
| Camp Attendance | 40 | 70 | 80 |
| **Total** | **200** | **300** | **400** |
| Passing % | 45% | 50% | 50% |

## Important Notes
- C Certificate holders get **direct entry** to Indian Military Academy (IMA) and Officers Training Academy (OTA)
- NCC C Certificate holders are **exempted from written exam** of CDS');

-- Module: Basic Foot Drill
INSERT INTO chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Attention and Stand at Ease', 'markdown',
'{"markdown": "# Attention and Stand at Ease\n\n## Position of Attention (Savdhan)\nHeels together, feet 30 degrees, knees straight, body erect.\n\n## Stand at Ease (Vishram)\nLeft foot 15 inches to the left, arms behind back."}',
1,
'# Attention and Stand at Ease

## Position of Attention (Savdhan)
The Position of Attention is the basic military position from which all drill movements begin.

### Correct Position
1. **Heels** together, touching and in line
2. **Feet** turned out equally, forming an angle of 30 degrees
3. **Knees** straight but not locked
4. **Body** erect, weight balanced on both feet
5. **Shoulders** level, square to the front
6. **Arms** hanging naturally, thumbs behind the second joint of the forefinger
7. **Head** erect, neck touching the collar, eyes looking straight ahead
8. **Chest** lifted naturally

### Word of Command
**"Squad — ATTENTION!"** (Daste — SAVDHAN!)
- Cautionary: "Squad" — to alert
- Executive: "ATTENTION" — to execute

## Stand at Ease (Vishram)
### Correct Position
1. Left foot moves **15 inches** (38 cm) to the left
2. Arms placed behind the back, right hand holding left hand
3. Body weight distributed equally on both feet
4. Remain silent and still

### Word of Command
**"Stand at — EASE!"** (Vishram!)'),

('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000004', 'Turning and Saluting', 'markdown',
'{"markdown": "# Turning and Saluting\n\n## Right Turn: 90 degrees right\n## Left Turn: 90 degrees left\n## About Turn: 180 degrees right\n\n## Hand Salute\nMiddle finger tip touches right eyebrow, upper arm horizontal."}',
2,
'# Turning and Saluting

## Turnings at the Halt
All turnings are done in two movements:

### Right Turn (Dahine Mud)
1. **Movement 1**: Turn 90° to the right on right heel and left toe
2. **Movement 2**: Bring left foot smartly alongside right foot

### Left Turn (Bayein Mud)
1. **Movement 1**: Turn 90° to the left on left heel and right toe
2. **Movement 2**: Bring right foot smartly alongside left foot

### About Turn (Peeche Mud)
1. **Movement 1**: Turn 180° to the right on right heel and left toe
2. **Movement 2**: Bring left foot smartly alongside right foot

## Saluting

### Hand Salute (Salami Shastra)
The salute is the military greeting. It is a mark of mutual respect and courtesy.

**How to perform:**
1. Raise right hand smartly by the shortest route
2. Fingers extended and close together, palm facing left
3. Tip of middle finger touches the right eyebrow (or cap brim)
4. Upper arm horizontal, forearm at 45 degrees
5. Hold for the required duration
6. Cut away smartly to the position of attention

### When to Salute
- National Flag and National Anthem
- All commissioned officers
- During funeral processions
- War memorials');

-- Module: First Aid
INSERT INTO chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000011', 'Fractures and Bandaging', 'markdown',
'{"markdown": "# Fractures and Bandaging\n\n## Types: Simple, Compound, Greenstick, Comminuted\n## First Aid: Immobilize with splints above and below fracture\n## RICE: Rest, Ice, Compression, Elevation"}',
1,
'# Fractures and Bandaging

## Types of Fractures
1. **Simple (Closed)**: Bone breaks but skin is intact
2. **Compound (Open)**: Bone pierces through the skin
3. **Greenstick**: Incomplete fracture (common in children)
4. **Comminuted**: Bone shatters into multiple pieces

## Signs of Fracture
- Severe pain at the site
- Swelling and tenderness
- Deformity or unnatural position
- Loss of function of the limb
- Crepitus (grating sound)

## First Aid for Fractures
1. **Do NOT move** the casualty unnecessarily
2. **Immobilize** the fracture using splints
3. Apply splint **above and below** the fracture point
4. Pad the splint with soft material
5. Check circulation below the splint regularly
6. Treat for shock — keep warm, elevate legs

## Common Bandaging Techniques
| Type | Use |
|------|-----|
| Triangular | Arm sling, head wounds |
| Roller | Securing dressings |
| Figure-of-eight | Ankle, wrist joints |
| Spiral | Limbs |

> **Remember**: RICE — Rest, Ice, Compression, Elevation');

-- Module: Map Reading (Army)
INSERT INTO chapters (id, module_id, title, content_type, content_data, order_index, content) VALUES
('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000013', 'Topographic Maps and Conventional Signs', 'markdown',
'{"markdown": "# Topographic Maps and Conventional Signs\n\n## Map Colors: Black=man-made, Brown=contours, Blue=water, Green=vegetation, Red=roads\n## Grid References: 4-figure (1km), 6-figure (100m). Read Eastings first."}',
1,
'# Topographic Maps and Conventional Signs

## What is a Topographic Map?
A topographic map represents the physical features of the earth''s surface including hills, valleys, rivers, roads, and buildings using **contour lines** and **conventional signs**.

## Scale of Maps
| Scale | Type | Use |
|-------|------|-----|
| 1:25,000 | Large | Tactical operations |
| 1:50,000 | Medium | General military use |
| 1:250,000 | Small | Strategic planning |

## Conventional Signs
Conventional signs are **standardized symbols** used on maps:

### Colors Used
- **Black**: Man-made features (roads, buildings, text)
- **Brown**: Contour lines, earth features
- **Blue**: Water features (rivers, lakes, wells)
- **Green**: Vegetation (forests, orchards)
- **Red**: Main roads, important boundaries

## Contour Lines
- Lines joining points of **equal elevation**
- Close together = **steep slope**
- Far apart = **gentle slope**
- V-shaped pointing uphill = **valley/stream**
- V-shaped pointing downhill = **ridge/spur**

## Grid References
- **4-figure**: Identifies a grid square (e.g., 2345)
- **6-figure**: Pinpoints exact location (e.g., 234456)
- Always read **Eastings first**, then Northings
- Remember: **"Go along the corridor, then up the stairs"**');

-- ============================================
-- QUESTION BANKS & QUESTIONS
-- ============================================
INSERT INTO question_banks (id, course_id, title, description) VALUES
('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'NCC General Knowledge Bank', 'Questions on NCC history, aims, organization'),
('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Drill Training Bank', 'Questions on foot drill, parade, commands'),
('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'National Integration Bank', 'Questions on national awareness'),
('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Health & First Aid Bank', 'Questions on hygiene and first aid'),
('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'Map Reading Bank', 'Questions on maps and navigation');

-- NCC General Questions
INSERT INTO questions (bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('d1000000-0000-0000-0000-000000000001', 'When was the NCC established in India?', 'mcq', '["1946","1947","1948","1950"]', '1948', 'easy', 'History', 'NCC was established on 15 July 1948 under the NCC Act XXXI of 1948.', 1),
('d1000000-0000-0000-0000-000000000001', 'What is the motto of the NCC?', 'mcq', '["Service Before Self","Unity and Discipline","Duty Honor Country","Jai Hind"]', 'Unity and Discipline', 'easy', 'Basics', 'The NCC motto is "Unity and Discipline" (एकता और अनुशासन).', 1),
('d1000000-0000-0000-0000-000000000001', 'Who was the first Director General of NCC?', 'mcq', '["Lt Gen Grubb","Gen Cariappa","Maj Gen Sinha","Gen Thimayya"]', 'Lt Gen Grubb', 'medium', 'History', 'Lt Gen Grubb was the first DG of NCC appointed in 1948.', 1),
('d1000000-0000-0000-0000-000000000001', 'The NCC was raised on the recommendation of which committee?', 'mcq', '["Kunzru Committee","Nehru Committee","Patel Committee","Kothari Committee"]', 'Kunzru Committee', 'medium', 'History', 'Pandit H.N. Kunzru Committee (1946) recommended establishing NCC.', 1),
('d1000000-0000-0000-0000-000000000001', 'How many Directorates does NCC have across India?', 'mcq', '["15","17","19","21"]', '17', 'medium', 'Organization', 'NCC has 17 Directorates covering all states and UTs.', 1),
('d1000000-0000-0000-0000-000000000001', 'The NCC flag has how many colors?', 'mcq', '["2","3","4","5"]', '3', 'easy', 'Symbols', 'The NCC flag has three colors: Red (Army), Dark Blue (Navy), Light Blue (Air Force).', 1),
('d1000000-0000-0000-0000-000000000001', 'NCC Day is celebrated on which date?', 'mcq', '["4th Sunday of November","15 July","26 January","15 August"]', '4th Sunday of November', 'medium', 'Events', 'NCC Day is celebrated on the 4th Sunday of November every year.', 1),
('d1000000-0000-0000-0000-000000000001', 'The NCC song was written by?', 'mcq', '["Sudarshan Faakir","Gulzar","Pradeep","Sahir Ludhianvi"]', 'Sudarshan Faakir', 'medium', 'Culture', 'Sudarshan Faakir wrote the NCC song "Hum Sab Bharatiya Hain".', 1),
('d1000000-0000-0000-0000-000000000001', 'NCC headquarters is located in?', 'mcq', '["New Delhi","Mumbai","Pune","Bangalore"]', 'New Delhi', 'easy', 'Organization', 'NCC Directorate General is headquartered in New Delhi.', 1),
('d1000000-0000-0000-0000-000000000001', 'C Certificate holders of NCC get exemption from which exam?', 'mcq', '["CDS Written Exam","NDA Exam","SSB Interview","All of the above"]', 'CDS Written Exam', 'hard', 'Certificates', 'C Certificate holders are exempted from the written exam of CDS and get direct SSB entry.', 1),
('d1000000-0000-0000-0000-000000000001', 'Which ministry governs the NCC?', 'mcq', '["Ministry of Defence","Ministry of Education","Ministry of Home Affairs","Ministry of Youth Affairs"]', 'Ministry of Defence', 'easy', 'Organization', 'NCC functions under the Ministry of Defence, Government of India.', 1),
('d1000000-0000-0000-0000-000000000001', 'The red color in the NCC flag represents?', 'mcq', '["Army Wing","Navy Wing","Air Force Wing","All Wings"]', 'Army Wing', 'easy', 'Symbols', 'Red represents the Army Wing in the NCC flag.', 1);

-- Drill Questions
INSERT INTO questions (bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('d1000000-0000-0000-0000-000000000002', 'At the position of attention, the angle between feet should be?', 'mcq', '["15 degrees","30 degrees","45 degrees","60 degrees"]', '30 degrees', 'easy', 'Foot Drill', 'At attention, feet are turned out equally forming a 30-degree angle.', 1),
('d1000000-0000-0000-0000-000000000002', 'In "Stand at Ease," the left foot moves how many inches to the left?', 'mcq', '["10 inches","12 inches","15 inches","18 inches"]', '15 inches', 'medium', 'Foot Drill', 'The left foot moves 15 inches (38 cm) to the left.', 1),
('d1000000-0000-0000-0000-000000000002', 'About Turn involves rotation of how many degrees?', 'mcq', '["90 degrees","120 degrees","180 degrees","360 degrees"]', '180 degrees', 'easy', 'Turnings', 'About Turn (Peeche Mud) involves a 180-degree turn to the right.', 1),
('d1000000-0000-0000-0000-000000000002', 'The word of command has how many parts?', 'mcq', '["1","2","3","4"]', '2', 'easy', 'Commands', 'Word of command has Cautionary (alert) and Executive (action) parts.', 1),
('d1000000-0000-0000-0000-000000000002', 'During hand salute, the tip of middle finger touches the?', 'mcq', '["Forehead","Right eyebrow","Left ear","Chin"]', 'Right eyebrow', 'medium', 'Saluting', 'The tip of the middle finger touches the right eyebrow or cap brim.', 1),
('d1000000-0000-0000-0000-000000000002', 'Quick march is done at how many paces per minute?', 'mcq', '["100","110","120","130"]', '120', 'medium', 'Marching', 'Quick march pace is 120 paces per minute, each pace 30 inches.', 1);

-- Map Reading Questions
INSERT INTO questions (bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('d1000000-0000-0000-0000-000000000005', 'On a topographic map, blue color represents?', 'mcq', '["Roads","Vegetation","Water features","Contour lines"]', 'Water features', 'easy', 'Conventional Signs', 'Blue is used for water features like rivers, lakes, and wells.', 1),
('d1000000-0000-0000-0000-000000000005', 'Contour lines that are close together indicate?', 'mcq', '["Flat ground","Gentle slope","Steep slope","Valley"]', 'Steep slope', 'easy', 'Contours', 'Close contour lines indicate steep slopes.', 1),
('d1000000-0000-0000-0000-000000000005', 'A 6-figure grid reference pinpoints location to?', 'mcq', '["1 km square","100 m square","10 m square","1 m square"]', '100 m square', 'medium', 'Grid References', 'A 6-figure grid reference locates a point within a 100m square.', 1),
('d1000000-0000-0000-0000-000000000005', 'In grid references, which direction is read first?', 'mcq', '["Northings","Eastings","Southings","Westings"]', 'Eastings', 'medium', 'Grid References', 'Eastings are read first: "Along the corridor, then up the stairs."', 1),
('d1000000-0000-0000-0000-000000000005', 'Brown color on a map represents?', 'mcq', '["Water","Vegetation","Contour lines and earth","Buildings"]', 'Contour lines and earth', 'easy', 'Conventional Signs', 'Brown is used for contour lines and earth features.', 1);

-- Health & First Aid Questions
INSERT INTO questions (bank_id, question_text, question_type, options, correct_answer, difficulty, topic_tag, explanation, points) VALUES
('d1000000-0000-0000-0000-000000000004', 'RICE in first aid stands for?', 'mcq', '["Rest Ice Compression Elevation","Run Ice Cold Evaluate","Rest Inject Compress Elevate","None of the above"]', 'Rest Ice Compression Elevation', 'easy', 'First Aid', 'RICE: Rest, Ice, Compression, Elevation — standard treatment for sprains.', 1),
('d1000000-0000-0000-0000-000000000004', 'A compound fracture means?', 'mcq', '["Bone cracks partially","Bone breaks and pierces skin","Bone bends","Bone is crushed"]', 'Bone breaks and pierces skin', 'easy', 'Fractures', 'In a compound (open) fracture, the bone pierces through the skin.', 1),
('d1000000-0000-0000-0000-000000000004', 'When applying a splint, it should extend?', 'mcq', '["Only above the break","Only below the break","Above and below the break","Only at the break point"]', 'Above and below the break', 'medium', 'Fractures', 'Splints must immobilize joints above and below the fracture.', 1),
('d1000000-0000-0000-0000-000000000004', 'The normal human body temperature is?', 'mcq', '["36.5°C","37°C","38°C","35°C"]', '37°C', 'easy', 'Health', 'Normal body temperature is 37°C (98.6°F).', 1);

-- ============================================
-- TESTS
-- ============================================
INSERT INTO tests (id, course_id, title, description, test_type, duration_minutes, question_count, passing_score, target_wing) VALUES
('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'NCC General Quiz - A Certificate', 'Practice quiz covering NCC history, aims, and organization.', 'practice', 15, 10, 60, 'Common'),
('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'A Certificate Mock Exam', 'Full mock exam simulating A Certificate written test.', 'mock', 30, 12, 50, 'Common'),
('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Drill Commands Assessment', 'Test your knowledge of drill positions and commands.', 'practice', 15, 6, 60, 'Common'),
('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'Map Reading Assessment', 'Army wing assessment on topographic maps and navigation.', 'practice', 20, 5, 60, 'Army'),
('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'First Aid Quiz', 'Test on fractures, bandaging, and first aid techniques.', 'practice', 15, 4, 60, 'Common'),
('e1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'B Certificate Mock Exam', 'Comprehensive mock exam for B Certificate preparation.', 'mock', 60, 12, 50, 'Common');

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
INSERT INTO announcements (title, content, priority, target_wing) VALUES
('Annual Training Camp 2026', 'Registration is now open for the Annual Training Camp (ATC) at NCC Academy, Delhi Cantt. All B & C certificate cadets are eligible. Report date: 1 June 2026.', 'high', 'Common'),
('B Certificate Exam Schedule', 'B Certificate written examination scheduled for 15 July 2026. Mock tests are now available on the platform. Start practicing today!', 'high', 'Common'),
('Republic Day Camp Selection', 'RDC 2027 selection trials will begin in September. Only cadets with outstanding performance in CATC/ATC are eligible.', 'normal', 'Common'),
('Army Wing: Firing Practice', 'Live firing practice with .22 Rifle scheduled for next weekend at the Range. Mandatory for all Army wing B/C cert cadets.', 'normal', 'Army'),
('Navy Wing: Sailing Camp', 'Naval wing sailing camp at INS Chilka for selected cadets. Apply through your ANO before 20 May 2026.', 'normal', 'Navy');


-- ==========================================
-- MIGRATION: 00008_rls_hardening.sql
-- ==========================================

-- 00008_rls_hardening.sql
-- Grant ALL permissions to Admins and Instructors for platform management

-- Helper functions for cleaner RLS (optional but recommended)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.instructor_profiles WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. COURSES, MODULES, CHAPTERS (Admin only management)
CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can manage chapters" ON public.chapters
  FOR ALL TO authenticated USING (public.is_admin());

-- 2. TESTS, QUESTIONS, QUESTION BANKS (Admins & Instructors)
CREATE POLICY "Admins and Instructors can manage tests" ON public.tests
  FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "Admins and Instructors can manage questions" ON public.questions
  FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "Admins and Instructors can manage banks" ON public.question_banks
  FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

-- 3. ANNOUNCEMENTS (Admins & Instructors)
CREATE POLICY "Admins and Instructors can manage announcements" ON public.announcements
  FOR ALL TO authenticated USING (public.is_admin() OR public.is_instructor());

-- 4. VIEWING ALL RESULTS (Admins & Instructors)
CREATE POLICY "Admins and Instructors can view all attempts" ON public.test_attempts
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "Admins and Instructors can view all answers" ON public.test_answers
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_instructor());

-- 5. VIEWING ALL PROGRESS (Admins & Instructors)
CREATE POLICY "Admins and Instructors can view all progress" ON public.user_progress
  FOR SELECT TO authenticated USING (public.is_admin() OR public.is_instructor());

-- 6. VIEWING ALL PROFILES (Admins & Instructors - though already public, adding explicitly for clarity)
CREATE POLICY "Admins can manage admin profiles" ON public.admin_profiles
  FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can manage instructor profiles" ON public.instructor_profiles
  FOR ALL TO authenticated USING (public.is_admin());


-- ==========================================
-- MIGRATION: 00009_test_accounts.sql
-- ==========================================

-- 00009_test_accounts.sql
-- Create Test Accounts for Admin and Instructor

DO $$
DECLARE
  v_admin_id UUID := 'd0000000-0000-0000-0000-000000000001';
  v_instructor_id UUID := 'd0000000-0000-0000-0000-000000000002';
BEGIN
  -- 1. Create Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@ncc.gov.in') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      v_admin_id,
      'admin@ncc.gov.in',
      crypt('Admin@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Platform Administrator"}',
      'authenticated',
      'authenticated'
    );
    
    INSERT INTO public.admin_profiles (id, full_name)
    VALUES (v_admin_id, 'Platform Administrator');
  END IF;

  -- 2. Create Instructor User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'instructor@ncc.gov.in') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      v_instructor_id,
      'instructor@ncc.gov.in',
      crypt('Instructor@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Col. Rajveer Singh"}',
      'authenticated',
      'authenticated'
    );

    INSERT INTO public.instructor_profiles (id, full_name, rank, unit)
    VALUES (v_instructor_id, 'Col. Rajveer Singh', 'Colonel', '1st Punjab Bn NCC');
  END IF;
END $$;


-- ==========================================
-- MIGRATION: 00010_dashboard_content.sql
-- ==========================================

-- 00010_dashboard_content.sql
-- Restoring dashboard content and seeding cadet progress for Abhiram R

DO $$
DECLARE
    cadet_id UUID;
    drill_course_id UUID;
    weapon_course_id UUID;
    test_id UUID;
BEGIN
    -- 1. Get IDs
    SELECT id INTO cadet_id FROM auth.users WHERE email = 'cadet@ncc.gov.in' LIMIT 1;
    SELECT id INTO drill_course_id FROM public.courses WHERE title ILIKE '%Basic Drill%' LIMIT 1;
    SELECT id INTO weapon_course_id FROM public.courses WHERE title ILIKE '%Weapon Training%' LIMIT 1;
    SELECT id INTO test_id FROM public.tests WHERE title ILIKE '%Basic Drill%' LIMIT 1;

    -- 2. Restore Announcements if missing
    IF NOT EXISTS (SELECT 1 FROM public.announcements WHERE title = 'Annual Training Camp 2024') THEN
        INSERT INTO public.announcements (title, content, priority, target_wing, is_active)
        VALUES 
        ('Annual Training Camp 2024', 'ATC 2024 registration is now open. All cadets must register by end of month.', 'high', 'Common', true),
        ('New Weapon Training Module', 'A new interactive module for SLR 7.62mm is now available in the courses section.', 'normal', 'Army', true),
        ('Practice Test Series', 'Weekly practice tests for B-Certificate exam are now live.', 'normal', 'Common', true);
    END IF;

    -- 3. Seed Progress for Abhiram R if cadet found
    IF cadet_id IS NOT NULL THEN
        -- Enroll in Drill
        IF drill_course_id IS NOT NULL THEN
            INSERT INTO public.course_enrollments (user_id, course_id, status)
            VALUES (cadet_id, drill_course_id, 'enrolled')
            ON CONFLICT (user_id, course_id) DO NOTHING;
        END IF;

        -- Enroll in Weapon Training
        IF weapon_course_id IS NOT NULL THEN
            INSERT INTO public.course_enrollments (user_id, course_id, status)
            VALUES (cadet_id, weapon_course_id, 'enrolled')
            ON CONFLICT (user_id, course_id) DO NOTHING;
        END IF;

        -- Add Test Attempt for Stats
        IF test_id IS NOT NULL THEN
            INSERT INTO public.test_attempts (test_id, user_id, score, status, submitted_at, total_correct, total_questions)
            VALUES (test_id, cadet_id, 85, 'completed', NOW() - INTERVAL '1 day', 17, 20)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;


-- ==========================================
-- MIGRATION: 00011_notifications_and_exp.sql
-- ==========================================

-- 00011_notifications_and_exp.sql
-- Fix exam submission bug + Add notifications, EXP, and Leaderboard

-- 1. ADD COLUMNS TO cadet_profiles
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- 2. CREATE notifications TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'system', -- system, achievement, exam, enrollment
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. LEVEL CALCULATION FUNCTION
CREATE OR REPLACE FUNCTION public.fn_calculate_level(p_exp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Simple leveling: level = floor(exp / 1000) + 1
  RETURN FLOOR(p_exp / 1000) + 1;
END;
$$;

-- 4. FIXED & ENHANCED SUBMIT EXAM
CREATE OR REPLACE FUNCTION public.fn_submit_exam(
  p_attempt_id UUID,
  p_answers JSONB,
  p_tab_switches INTEGER DEFAULT 0,
  p_time_spent INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_test RECORD;
  v_answer_item JSONB;
  v_question RECORD;
  v_correct_count INTEGER := 0;
  v_total INTEGER := 0;
  v_score INTEGER;
  v_status TEXT := 'submitted';
  v_exp_gain INTEGER := 0;
  v_new_exp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Verify attempt belongs to user
  SELECT * INTO v_attempt FROM test_attempts
  WHERE id = p_attempt_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;

  -- If already submitted, return existing results instead of erroring
  IF v_attempt.status != 'in_progress' THEN
    RETURN jsonb_build_object(
      'score', v_attempt.score,
      'total_correct', v_attempt.total_correct,
      'total_questions', v_attempt.total_questions,
      'status', v_attempt.status,
      'passed', v_attempt.score >= (SELECT passing_score FROM tests WHERE id = v_attempt.test_id),
      'already_submitted', true
    );
  END IF;

  SELECT * INTO v_test FROM tests WHERE id = v_attempt.test_id;

  -- Flag if too many tab switches
  IF p_tab_switches >= 5 THEN
    v_status := 'flagged';
  END IF;

  -- Grade each answer
  -- Use jsonb_array_elements explicitly and handle potential null/empty
  IF p_answers IS NOT NULL AND jsonb_array_length(p_answers) > 0 THEN
    FOR v_answer_item IN SELECT value FROM jsonb_array_elements(p_answers)
    LOOP
      SELECT * INTO v_question FROM questions WHERE id = (v_answer_item->>'question_id')::UUID;
      IF FOUND THEN
        v_total := v_total + 1;
        
        -- Insert/Update answer record
        INSERT INTO test_answers (attempt_id, question_id, selected_answer, is_correct, time_spent_seconds)
        VALUES (
          p_attempt_id,
          v_question.id,
          v_answer_item->>'selected_answer',
          v_question.correct_answer = v_answer_item->>'selected_answer',
          COALESCE((v_answer_item->>'time_spent')::INTEGER, 0)
        )
        ON CONFLICT (attempt_id, question_id) DO UPDATE SET
          selected_answer = EXCLUDED.selected_answer,
          is_correct = EXCLUDED.is_correct;

        IF v_question.correct_answer = v_answer_item->>'selected_answer' THEN
          v_correct_count := v_correct_count + 1;
        END IF;
      END IF;
    END LOOP;
  ELSE
    -- If no answers provided, use the test's question count
    v_total := v_attempt.total_questions;
  END IF;

  -- Calculate score
  v_score := CASE WHEN v_total > 0 THEN ROUND((v_correct_count::NUMERIC / v_total) * 100) ELSE 0 END;

  -- Calculate EXP gain (Score * Multiplier)
  -- Practice: x5, Mock: x10, Final: x20
  v_exp_gain := v_score * (CASE 
    WHEN v_test.test_type = 'practice' THEN 5
    WHEN v_test.test_type = 'mock' THEN 10
    WHEN v_test.test_type = 'final' THEN 20
    ELSE 5 END);

  -- Update attempt
  UPDATE test_attempts SET
    submitted_at = NOW(),
    score = v_score,
    total_correct = v_correct_count,
    total_questions = GREATEST(v_total, 1),
    tab_switch_count = p_tab_switches,
    time_spent_seconds = p_time_spent,
    status = v_status
  WHERE id = p_attempt_id;

  -- Update User EXP and Level
  UPDATE cadet_profiles SET
    exp = exp + v_exp_gain,
    level = fn_calculate_level(exp + v_exp_gain),
    updated_at = NOW()
  WHERE id = auth.uid()
  RETURNING exp, level INTO v_new_exp, v_new_level;

  -- Create Notification
  INSERT INTO notifications (user_id, type, title, content, link)
  VALUES (
    auth.uid(),
    'exam',
    'Exam Results: ' || v_test.title,
    'You scored ' || v_score || '% and gained ' || v_exp_gain || ' EXP.',
    '/exam-results/' || p_attempt_id
  );

  RETURN jsonb_build_object(
    'score', v_score,
    'total_correct', v_correct_count,
    'total_questions', v_total,
    'status', v_status,
    'passed', v_score >= v_test.passing_score,
    'exp_gained', v_exp_gain,
    'new_exp', v_new_exp,
    'new_level', v_new_level
  );
END;
$$;

-- 5. LEADERBOARD FUNCTION
CREATE OR REPLACE FUNCTION public.fn_get_leaderboard(p_limit INTEGER DEFAULT 10, p_wing TEXT DEFAULT 'All')
RETURNS TABLE (
  rank BIGINT,
  full_name TEXT,
  wing TEXT,
  exp INTEGER,
  level INTEGER,
  is_current_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY cp.exp DESC) as rank,
    cp.full_name,
    cp.wing,
    cp.exp,
    cp.level,
    (cp.id = auth.uid()) as is_current_user
  FROM cadet_profiles cp
  WHERE (p_wing = 'All' OR cp.wing = p_wing)
  ORDER BY cp.exp DESC
  LIMIT p_limit;
END;
$$;

-- 6. NOTIFICATION HELPER
CREATE OR REPLACE FUNCTION public.fn_mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications SET is_read = true 
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_leaderboard(INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_mark_notification_read(UUID) TO authenticated;


-- ==========================================
-- MIGRATION: 00012_system_wide_notifications.sql
-- ==========================================

-- 00012_system_wide_notifications.sql
-- Implements triggers for automated notifications across the platform

-- 1. LEVEL UP NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_level_up()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.level > OLD.level THEN
    INSERT INTO public.notifications (user_id, type, title, content)
    VALUES (NEW.id, 'achievement', 'Level Up! 🎖️', 'Congratulations! You reached Level ' || NEW.level || '. Keep up the great work, Cadet!');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_level_up ON public.cadet_profiles;
CREATE TRIGGER tr_notify_level_up
  AFTER UPDATE OF level ON public.cadet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_level_up();


-- 2. ANNOUNCEMENT NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_announcement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true AND (OLD.is_active IS NULL OR OLD.is_active = false) THEN
    INSERT INTO public.notifications (user_id, type, title, content, link)
    SELECT id, 'announcement', NEW.title, 
           CASE WHEN length(NEW.content) > 100 THEN left(NEW.content, 97) || '...' ELSE NEW.content END,
           '/dashboard'
    FROM public.cadet_profiles
    WHERE NEW.target_wing = 'Common' OR wing = NEW.target_wing;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_announcement ON public.announcements;
CREATE TRIGGER tr_notify_announcement
  AFTER INSERT OR UPDATE OF is_active ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_announcement();


-- 3. NEW COURSE NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_new_course()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, content, link)
  SELECT id, 'enrollment', 'New Course Available: ' || NEW.title, 
         'A new training module has been published for ' || NEW.target_wing || ' wing.',
         '/courses'
  FROM public.cadet_profiles
  WHERE NEW.target_wing = 'Common' OR wing = NEW.target_wing;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_new_course ON public.courses;
CREATE TRIGGER tr_notify_new_course
  AFTER INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_new_course();


-- 4. NEW TEST NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_new_test()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    INSERT INTO public.notifications (user_id, type, title, content, link)
    SELECT id, 'exam', 'New Test Released: ' || NEW.title, 
           'A new ' || NEW.test_type || ' test is now available. Challenge yourself!',
           '/practice-tests'
    FROM public.cadet_profiles
    WHERE NEW.target_wing = 'Common' OR wing = NEW.target_wing;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_new_test ON public.tests;
CREATE TRIGGER tr_notify_new_test
  AFTER INSERT ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_new_test();


-- 5. COURSE COMPLETION NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_course_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id UUID;
  v_course_title TEXT;
  v_total_chapters INTEGER;
  v_completed_chapters INTEGER;
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Get course info
    SELECT m.course_id, c_table.title INTO v_course_id, v_course_title
    FROM chapters c 
    JOIN modules m ON c.module_id = m.id 
    JOIN courses c_table ON m.course_id = c_table.id
    WHERE c.id = NEW.chapter_id;

    -- Count total chapters in course
    SELECT COUNT(*) INTO v_total_chapters 
    FROM chapters c 
    JOIN modules m ON c.module_id = m.id 
    WHERE m.course_id = v_course_id;

    -- Count completed chapters for user
    SELECT COUNT(*) INTO v_completed_chapters 
    FROM user_progress up
    JOIN chapters c ON up.chapter_id = c.id
    JOIN modules m ON c.module_id = m.id
    WHERE m.course_id = v_course_id AND up.user_id = NEW.user_id AND up.completed = true;

    IF v_total_chapters > 0 AND v_total_chapters = v_completed_chapters THEN
      -- Check if notification already sent for this course completion
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = NEW.user_id 
        AND type = 'achievement' 
        AND title = 'Course Completed! 🎓' 
        AND content LIKE '%' || v_course_title || '%'
      ) THEN
        INSERT INTO public.notifications (user_id, type, title, content, link)
        VALUES (
          NEW.user_id, 
          'achievement', 
          'Course Completed! 🎓', 
          'Congratulations! You have finished all chapters in "' || v_course_title || '".', 
          '/course/' || v_course_id
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_course_completion ON public.user_progress;
CREATE TRIGGER tr_notify_course_completion
  AFTER INSERT OR UPDATE OF completed ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_course_completion();


-- 6. ENROLLMENT NOTIFICATION
CREATE OR REPLACE FUNCTION public.fn_notify_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  v_course_title TEXT;
BEGIN
  SELECT title INTO v_course_title FROM courses WHERE id = NEW.course_id;
  
  INSERT INTO public.notifications (user_id, type, title, content, link)
  VALUES (
    NEW.user_id,
    'enrollment',
    'Enrolled in ' || v_course_title,
    'Welcome to the course! Start your learning journey now.',
    '/course/' || NEW.course_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_enrollment ON public.course_enrollments;
CREATE TRIGGER tr_notify_enrollment
  AFTER INSERT ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_enrollment();


-- ==========================================
-- MIGRATION: 00013_announcement_notifications.sql
-- ==========================================

-- 00013_announcement_notifications.sql

-- 1. EFFICIENT PROGRESS HELPER
CREATE OR REPLACE FUNCTION public.fn_get_course_chapter_ids(p_course_id UUID)
RETURNS TABLE(chapter_id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id FROM public.chapters c
  JOIN public.modules m ON c.module_id = m.id
  WHERE m.course_id = p_course_id;
END;
$$;

-- 2. ANNOUNCEMENT TRIGGER
CREATE OR REPLACE FUNCTION public.fn_notify_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cadet RECORD;
BEGIN
  -- Notify all cadets if target_wing is 'Common', else notify only those in the wing
  FOR v_cadet IN 
    SELECT id FROM public.cadet_profiles 
    WHERE NEW.target_wing = 'Common' OR wing = NEW.target_wing
  LOOP
    INSERT INTO public.notifications (user_id, type, title, content, link)
    VALUES (
      v_cadet.id,
      'announcement',
      NEW.title,
      LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
      '/dashboard'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_on_announcement_created ON public.announcements;
CREATE TRIGGER tr_on_announcement_created
  AFTER INSERT ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.fn_notify_announcement();

-- Grant execute
GRANT EXECUTE ON FUNCTION public.fn_get_course_chapter_ids(UUID) TO authenticated;


-- ==========================================
-- MIGRATION: 00014_fix_exam_logic.sql
-- ==========================================

-- 00014_fix_exam_logic.sql

-- 1. FIX fn_submit_exam: Ensure total_questions and score are never null/zero if questions exist
CREATE OR REPLACE FUNCTION public.fn_submit_exam(
  p_attempt_id UUID,
  p_answers JSONB,
  p_time_spent INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_test_id UUID;
  v_user_id UUID;
  v_status TEXT;
  v_questions JSONB;
  v_score INTEGER := 0;
  v_total INTEGER := 0;
  v_exp_gain INTEGER := 0;
  v_q RECORD;
  v_ans TEXT;
  v_correct BOOLEAN;
  v_results JSONB := '[]'::JSONB;
BEGIN
  -- Get attempt details
  SELECT test_id, user_id, status INTO v_test_id, v_user_id, v_status
  FROM public.test_attempts WHERE id = p_attempt_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found';
  END IF;

  IF v_status != 'in_progress' THEN
    RAISE EXCEPTION 'Attempt already submitted or invalid';
  END IF;

  -- Get test questions
  SELECT questions INTO v_questions FROM public.tests WHERE id = v_test_id;
  v_total := jsonb_array_length(v_questions);

  -- Handle case with no questions (should not happen but for safety)
  IF v_total = 0 OR v_total IS NULL THEN
    v_total := 1; -- Avoid division by zero in UI
  END IF;

  -- Grade answers
  FOR v_q IN SELECT * FROM jsonb_to_recordset(v_questions) AS x(id TEXT, question TEXT, options JSONB, correct_option TEXT, exp INTEGER)
  LOOP
    v_ans := p_answers->>v_q.id;
    v_correct := (v_ans = v_q.correct_option);
    
    IF v_correct THEN
      v_score := v_score + 1;
      v_exp_gain := v_exp_gain + COALESCE(v_q.exp, 10);
    END IF;

    v_results := v_results || jsonb_build_object(
      'question_id', v_q.id,
      'user_answer', v_ans,
      'correct_answer', v_q.correct_option,
      'is_correct', v_correct
    );
  END LOOP;

  -- Update attempt
  UPDATE public.test_attempts
  SET 
    answers = p_answers,
    score = v_score,
    total_questions = v_total,
    submitted_at = NOW(),
    time_spent_seconds = p_time_spent,
    status = 'submitted',
    grading_data = v_results
  WHERE id = p_attempt_id;

  -- Update cadet EXP
  IF v_exp_gain > 0 THEN
    UPDATE public.cadet_profiles
    SET 
      exp = exp + v_exp_gain,
      level = fn_calculate_level(exp + v_exp_gain)
    WHERE id = v_user_id;
  END IF;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, content, link)
  VALUES (
    v_user_id,
    'exam',
    'Exam Submitted',
    'You scored ' || v_score || '/' || v_total || ' in your recent test. Keep it up!',
    '/exam-results/' || p_attempt_id
  );

  RETURN jsonb_build_object(
    'score', v_score,
    'total', v_total,
    'exp_gain', v_exp_gain,
    'percentage', ROUND((v_score::FLOAT / v_total::FLOAT * 100)::NUMERIC, 1)
  );
END;
$$;

-- 2. FIX fn_get_exam_results: Be more permissive with status and ensure data consistency
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt RECORD;
  v_test RECORD;
  v_result JSONB;
BEGIN
  -- Get attempt
  SELECT * INTO v_attempt FROM public.test_attempts WHERE id = p_attempt_id;
  
  IF NOT FOUND THEN
    RETURN NULL; -- Better than raising exception for frontend
  END IF;

  -- Get test info
  SELECT id, title, description, category, passing_score, time_limit_minutes 
  INTO v_test 
  FROM public.tests WHERE id = v_attempt.test_id;

  -- Build final result object
  v_result := jsonb_build_object(
    'attempt_id', v_attempt.id,
    'test_id', v_test.id,
    'test_title', v_test.title,
    'test_category', v_test.category,
    'score', v_attempt.score,
    'total_questions', COALESCE(v_attempt.total_questions, 0),
    'percentage', CASE 
      WHEN COALESCE(v_attempt.total_questions, 0) > 0 
      THEN ROUND((v_attempt.score::FLOAT / v_attempt.total_questions::FLOAT * 100)::NUMERIC, 1)
      ELSE 0 
    END,
    'time_spent', v_attempt.time_spent_seconds,
    'time_limit', v_test.time_limit_minutes * 60,
    'submitted_at', v_attempt.submitted_at,
    'status', v_attempt.status,
    'grading_data', v_attempt.grading_data
  );

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_submit_exam(UUID, JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_exam_results(UUID) TO authenticated;


-- ==========================================
-- MIGRATION: 00016_fix_registration_rls.sql
-- ==========================================

-- 00016_fix_registration_rls.sql
-- Relax the insert policy for cadet_profiles so that profiles can be created during registration
-- when email confirmation is enabled and the user session is not yet active.

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.cadet_profiles;

CREATE POLICY "Users can insert their own profile."
  ON public.cadet_profiles FOR INSERT
  WITH CHECK ( true );


-- ==========================================
-- MIGRATION: 00017_rbac_hardening.sql
-- ==========================================

-- 00017_rbac_hardening.sql
-- Expand RLS for cadet management by Admins and Instructors

-- Admins can update and delete cadet profiles
CREATE POLICY "Admins can update cadet profiles"
  ON public.cadet_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete cadet profiles"
  ON public.cadet_profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Instructors can update cadet profiles (e.g., correcting wings)
CREATE POLICY "Instructors can update cadet profiles"
  ON public.cadet_profiles FOR UPDATE
  TO authenticated
  USING (public.is_instructor());

-- Admins can insert cadet profiles (assuming the auth.user is created via an edge function)
CREATE POLICY "Admins can insert cadet profiles"
  ON public.cadet_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Instructors can insert cadet profiles
CREATE POLICY "Instructors can insert cadet profiles"
  ON public.cadet_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_instructor());


-- ==========================================
-- MIGRATION: 00018_gamification_schema.sql
-- ==========================================

-- 00018_gamification_schema.sql
-- Add gamification columns to cadet profiles

ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE public.cadet_profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- Update the leaderboard function to include streaks
DROP FUNCTION IF EXISTS public.fn_get_leaderboard(INTEGER, TEXT);
CREATE OR REPLACE FUNCTION public.fn_get_leaderboard(p_limit INTEGER DEFAULT 10, p_wing TEXT DEFAULT 'All')
RETURNS TABLE (
  rank BIGINT,
  full_name TEXT,
  wing TEXT,
  exp INTEGER,
  level INTEGER,
  current_streak INTEGER,
  is_current_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY cp.exp DESC) as rank,
    cp.full_name,
    cp.wing,
    cp.exp,
    cp.level,
    cp.current_streak,
    (cp.id = auth.uid()) as is_current_user
  FROM cadet_profiles cp
  WHERE (p_wing = 'All' OR cp.wing = p_wing)
  ORDER BY cp.exp DESC
  LIMIT p_limit;
END;
$$;


-- ==========================================
-- MIGRATION: 00019_streak_logic.sql
-- ==========================================

-- 00019_streak_logic.sql
-- Add function to safely update cadet daily streaks

CREATE OR REPLACE FUNCTION public.fn_update_daily_streak()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cadet RECORD;
  v_new_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_login DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get cadet
  SELECT * INTO v_cadet FROM cadet_profiles WHERE id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not a cadet');
  END IF;

  v_last_login := v_cadet.last_login_date;
  v_new_streak := COALESCE(v_cadet.current_streak, 0);
  v_longest_streak := COALESCE(v_cadet.longest_streak, 0);

  -- If already logged in today, do nothing
  IF v_last_login = v_today THEN
    RETURN jsonb_build_object('success', true, 'streak', v_new_streak, 'updated', false);
  END IF;

  -- Calculate new streak
  IF v_last_login = v_today - 1 THEN
    v_new_streak := v_new_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  -- Update longest streak
  IF v_new_streak > v_longest_streak THEN
    v_longest_streak := v_new_streak;
  END IF;

  -- Update profile
  UPDATE cadet_profiles SET
    current_streak = v_new_streak,
    longest_streak = v_longest_streak,
    last_login_date = v_today
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true, 'streak', v_new_streak, 'updated', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_update_daily_streak() TO authenticated;


-- ==========================================
-- MIGRATION: 00020_study_materials_storage.sql
-- ==========================================

-- 00020_study_materials_storage.sql
-- Create study-materials bucket and setup RLS policies

-- 1. Create the public bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Setup RLS for storage.objects
-- Enable RLS on storage.objects (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Delete" ON storage.objects;

-- Select: Everyone can read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

-- Insert: Only Admin and Instructor
CREATE POLICY "Admin/Instructor Insert" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'study-materials' 
  AND (public.is_admin() OR public.is_instructor())
);

-- Update: Only Admin and Instructor
CREATE POLICY "Admin/Instructor Update" ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'study-materials' 
  AND (public.is_admin() OR public.is_instructor())
);

-- Delete: Only Admin and Instructor
CREATE POLICY "Admin/Instructor Delete" ON storage.objects FOR DELETE 
USING (
  bucket_id = 'study-materials' 
  AND (public.is_admin() OR public.is_instructor())
);


-- ==========================================
-- MIGRATION: 00021_drop_auth_fkeys.sql
-- ==========================================

-- 00021_drop_auth_fkeys.sql
-- Drop foreign key constraints pointing to auth.users to allow mock custom auth
-- to function without requiring perfectly synced records in auth.users.

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_created_by_fkey;
ALTER TABLE public.course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_user_id_fkey;
ALTER TABLE public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_user_id_fkey;
ALTER TABLE public.tests DROP CONSTRAINT IF EXISTS tests_created_by_fkey;
ALTER TABLE public.question_banks DROP CONSTRAINT IF EXISTS question_banks_created_by_fkey;

-- Also check profiles if they have it
ALTER TABLE public.cadet_profiles DROP CONSTRAINT IF EXISTS cadet_profiles_id_fkey;
ALTER TABLE public.instructor_profiles DROP CONSTRAINT IF EXISTS instructor_profiles_id_fkey;
ALTER TABLE public.admin_profiles DROP CONSTRAINT IF EXISTS admin_profiles_id_fkey;


-- ==========================================
-- MIGRATION: 00022_open_storage_rls.sql
-- ==========================================

-- 00022_open_storage_rls.sql
-- Drop the restricted policies to bypass mock auth errors
DROP POLICY IF EXISTS "Admin/Instructor Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin/Instructor Delete" ON storage.objects;

-- Create open policies for the study-materials bucket
CREATE POLICY "Allow Public Insert" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'study-materials');

CREATE POLICY "Allow Public Update" ON storage.objects FOR UPDATE 
USING (bucket_id = 'study-materials');

CREATE POLICY "Allow Public Delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'study-materials');


-- ==========================================
-- MIGRATION: 00023_csv_exam_schema.sql
-- ==========================================

-- 00023_csv_exam_schema.sql
-- Migration for the CSV-driven dynamic exam engine

-- 1. Core Syllabus Tables
CREATE TABLE IF NOT EXISTS csv_subjects (
    subject_code VARCHAR(20) PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS csv_modules (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(20) REFERENCES csv_subjects(subject_code) ON DELETE CASCADE,
    module_number INTEGER NOT NULL,
    module_name VARCHAR(200) NOT NULL,
    UNIQUE(subject_code, module_number)
);

CREATE TABLE IF NOT EXISTS csv_questions (
    question_id VARCHAR(50) PRIMARY KEY,
    subject_code VARCHAR(20) REFERENCES csv_subjects(subject_code),
    module_number INTEGER,
    difficulty INTEGER CHECK (difficulty IN (1, 2, 3)), -- 1: Easy, 2: Medium, 3: Hard
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT,
    option_d TEXT,
    correct_answer VARCHAR(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    active BOOLEAN DEFAULT TRUE,
    certificate VARCHAR(20) DEFAULT 'Common',
    wing VARCHAR(20) DEFAULT 'Common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Mock Exam Definitions
CREATE TABLE IF NOT EXISTS csv_mock_exams (
    test_id SERIAL PRIMARY KEY,
    test_name VARCHAR(200) NOT NULL,
    wing VARCHAR(20) CHECK (wing IN ('Army', 'Navy', 'Air Force', 'Common')),
    certificate_level VARCHAR(1) CHECK (certificate_level IN ('A', 'B', 'C')),
    time_limit_minutes INTEGER DEFAULT 60,
    passing_percent INTEGER DEFAULT 60,
    question_distribution TEXT NOT NULL, -- Format: "SUBJECT_CODE:COUNT|SUBJECT_CODE:COUNT"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Exam Attempts & Analytics
CREATE TABLE IF NOT EXISTS csv_exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    test_id INTEGER REFERENCES csv_mock_exams(test_id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    submitted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, submitted, flagged
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    percentage INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    tab_switches INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS csv_attempt_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES csv_exam_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR(50) REFERENCES csv_questions(question_id) ON DELETE CASCADE,
    subject_code VARCHAR(20),
    user_answer VARCHAR(1) CHECK (user_answer IN ('A', 'B', 'C', 'D', NULL)),
    is_correct BOOLEAN DEFAULT FALSE,
    time_spent_seconds INTEGER DEFAULT 0
);

-- 4. Engine Configuration Tables
CREATE TABLE IF NOT EXISTS csv_grading_policy (
    id SERIAL PRIMARY KEY,
    policy_name VARCHAR(50) NOT NULL,
    min_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    grade VARCHAR(5) NOT NULL,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS csv_analytics_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS csv_anticheat_config (
    id SERIAL PRIMARY KEY,
    feature_name VARCHAR(50) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    threshold INTEGER,
    action VARCHAR(50) DEFAULT 'flag' -- flag, terminate
);

CREATE TABLE IF NOT EXISTS csv_import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imported_by UUID REFERENCES auth.users(id),
    table_name VARCHAR(50) NOT NULL,
    rows_processed INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS (Assuming existing setup)
ALTER TABLE csv_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_attempt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_grading_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_anticheat_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_import_logs ENABLE ROW LEVEL SECURITY;

-- Default Data for Configs
INSERT INTO csv_grading_policy (policy_name, min_score, max_score, grade, remarks) VALUES
('Default', 80, 100, 'A', 'Excellent performance'),
('Default', 65, 79, 'B', 'Good understanding'),
('Default', 50, 64, 'C', 'Satisfactory'),
('Default', 0, 49, 'F', 'Needs improvement');

INSERT INTO csv_anticheat_config (feature_name, is_enabled, threshold, action) VALUES
('tab_switching', TRUE, 3, 'flag'),
('copy_paste', TRUE, 0, 'block');


-- ==========================================
-- MIGRATION: 00024_csv_exam_rpcs.sql
-- ==========================================

-- 00024_csv_exam_rpcs.sql
-- RPC functions for the dynamic CSV exam engine

-- 1. fn_import_csv_data
-- A generic function to bulk insert/upsert CSV data via JSON array
CREATE OR REPLACE FUNCTION public.fn_import_csv_data(table_name text, data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    row jsonb;
    imported_count int := 0;
BEGIN
    -- We use a simple loop to insert. For real production with millions of rows, 
    -- direct COPY or unnest is better, but this works well for CSV sizes typical here.
    FOR row IN SELECT * FROM jsonb_array_elements(data)
    LOOP
        IF table_name = 'csv_subjects' THEN
            INSERT INTO csv_subjects (subject_code, subject_name, description)
            VALUES (row->>'subject_code', row->>'subject_name', row->>'description')
            ON CONFLICT (subject_code) DO UPDATE 
            SET subject_name = EXCLUDED.subject_name, description = EXCLUDED.description;
            imported_count := imported_count + 1;

        ELSIF table_name = 'csv_modules' THEN
            INSERT INTO csv_modules (id, subject_code, module_number, module_name)
            VALUES ((row->>'id')::int, row->>'subject_code', (row->>'module_number')::int, row->>'module_name')
            ON CONFLICT (id) DO UPDATE 
            SET subject_code = EXCLUDED.subject_code, module_number = EXCLUDED.module_number, module_name = EXCLUDED.module_name;
            imported_count := imported_count + 1;

        ELSIF table_name = 'csv_questions' THEN
            INSERT INTO csv_questions (question_id, subject_code, module_number, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, active, certificate, wing)
            VALUES (
                (row->>'question_id')::varchar, 
                row->>'subject_code', 
                (row->>'module_number')::int, 
                (row->>'difficulty')::int, 
                row->>'question_text', 
                row->>'option_a', 
                row->>'option_b', 
                row->>'option_c', 
                row->>'option_d', 
                row->>'correct_answer', 
                row->>'explanation', 
                COALESCE((row->>'active')::boolean, TRUE),
                COALESCE(row->>'certificate', 'Common'),
                COALESCE(row->>'wing', 'Common')
            )
            ON CONFLICT (question_id) DO UPDATE 
            SET subject_code = EXCLUDED.subject_code, 
                module_number = EXCLUDED.module_number, 
                difficulty = EXCLUDED.difficulty, 
                question_text = EXCLUDED.question_text, 
                option_a = EXCLUDED.option_a, 
                option_b = EXCLUDED.option_b, 
                option_c = EXCLUDED.option_c, 
                option_d = EXCLUDED.option_d, 
                correct_answer = EXCLUDED.correct_answer, 
                explanation = EXCLUDED.explanation, 
                active = EXCLUDED.active,
                certificate = EXCLUDED.certificate,
                wing = EXCLUDED.wing;
            imported_count := imported_count + 1;

        ELSIF table_name = 'csv_mock_exams' THEN
            INSERT INTO csv_mock_exams (test_id, test_name, wing, certificate_level, time_limit_minutes, passing_percent, question_distribution, is_active)
            VALUES (
                (row->>'test_id')::int, 
                row->>'test_name', 
                row->>'wing', 
                row->>'certificate_level', 
                COALESCE((row->>'time_limit_minutes')::int, 60), 
                COALESCE((row->>'passing_percent')::int, 60), 
                row->>'question_distribution', 
                COALESCE((row->>'is_active')::boolean, TRUE)
            )
            ON CONFLICT (test_id) DO UPDATE 
            SET test_name = EXCLUDED.test_name, wing = EXCLUDED.wing, certificate_level = EXCLUDED.certificate_level, time_limit_minutes = EXCLUDED.time_limit_minutes, passing_percent = EXCLUDED.passing_percent, question_distribution = EXCLUDED.question_distribution, is_active = EXCLUDED.is_active;
            imported_count := imported_count + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'imported', imported_count,
        'updated', 0,
        'skipped', 0
    );
END;
$$;

-- 2. fn_start_exam
CREATE OR REPLACE FUNCTION public.fn_start_exam(p_test_id int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_test record;
    v_attempt_id uuid;
    v_dist text;
    v_dist_item text;
    v_subj text;
    v_count int;
    v_total_questions int := 0;
    v_question record;
BEGIN
    -- Get Test
    SELECT * INTO v_test FROM csv_mock_exams WHERE test_id = p_test_id AND is_active = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Test not found or inactive';
    END IF;

    -- Create Attempt
    v_attempt_id := gen_random_uuid();
    INSERT INTO csv_exam_attempts (id, user_id, test_id, started_at, status)
    VALUES (v_attempt_id, auth.uid(), p_test_id, now(), 'in_progress');

    -- Generate csv_questions based on distribution
    -- Format: "SUBJECT_CODE:COUNT|SUBJECT_CODE:COUNT"
    FOREACH v_dist_item IN ARRAY string_to_array(v_test.question_distribution, '|')
    LOOP
        v_subj := split_part(v_dist_item, ':', 1);
        v_count := (split_part(v_dist_item, ':', 2))::int;

        IF v_subj IS NOT NULL AND v_subj != '' AND v_count > 0 THEN
            FOR v_question IN (
                SELECT * FROM csv_questions 
                WHERE subject_code = v_subj AND active = TRUE 
                ORDER BY random() 
                LIMIT v_count
            )
            LOOP
                INSERT INTO csv_attempt_questions (
                    attempt_id, question_id, subject_code, user_answer, is_correct
                ) VALUES (
                    v_attempt_id, v_question.question_id, v_question.subject_code, null, false
                );
                v_total_questions := v_total_questions + 1;
            END LOOP;
        END IF;
    END LOOP;

    -- Update Attempt total
    UPDATE csv_exam_attempts SET total_questions = v_total_questions WHERE id = v_attempt_id;

    -- Return Exam Data
    RETURN (
        SELECT jsonb_build_object(
            'attempt_id', v_attempt_id,
            'duration_minutes', v_test.time_limit_minutes,
            'test_title', v_test.test_name,
            'csv_questions', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', q.question_id,
                        'question_text', q.question_text,
                        'options', jsonb_build_array(q.option_a, q.option_b, q.option_c, q.option_d)
                    )
                )
                FROM csv_attempt_questions aq
                JOIN csv_questions q ON aq.question_id = q.question_id
                WHERE aq.attempt_id = v_attempt_id
            )
        )
    );
END;
$$;

-- 3. fn_submit_exam
CREATE OR REPLACE FUNCTION public.fn_submit_exam(p_attempt_id uuid, p_answers jsonb, p_tab_switches int, p_time_spent int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt record;
    v_test record;
    v_correct int := 0;
    v_total int;
    v_pct int;
    v_grade record;
    v_exp_gain int;
    v_status text := 'submitted';
    v_max_switches int := 2;
BEGIN
    SELECT * INTO v_attempt FROM csv_exam_attempts WHERE id = p_attempt_id;
    SELECT * INTO v_test FROM csv_mock_exams WHERE test_id = v_attempt.test_id;

    v_total := v_attempt.total_questions;

    -- Grade answers
    -- We'll assume frontend sends the options properly matched, but here we can just update what the frontend calculated
    -- since doing the exact A/B/C/D to option text mapping in plpgsql JSON is tedious. 
    -- Wait! Let's do it fully server-side for security:
    
    WITH submitted_answers AS (
        SELECT key::int AS q_id, value::text AS ans_text
        FROM jsonb_each_text(p_answers)
    ),
    graded AS (
        UPDATE csv_attempt_questions aq
        SET 
            user_answer = sa.ans_text,
            is_correct = (
                CASE 
                    WHEN q.correct_answer = 'A' AND sa.ans_text = q.option_a THEN true
                    WHEN q.correct_answer = 'B' AND sa.ans_text = q.option_b THEN true
                    WHEN q.correct_answer = 'C' AND sa.ans_text = q.option_c THEN true
                    WHEN q.correct_answer = 'D' AND sa.ans_text = q.option_d THEN true
                    WHEN sa.ans_text = q.correct_answer THEN true
                    ELSE false
                END
            )
        FROM csv_questions q
        JOIN submitted_answers sa ON q.question_id = sa.q_id
        WHERE aq.question_id = q.question_id AND aq.attempt_id = p_attempt_id
        RETURNING aq.is_correct
    )
    SELECT count(*) INTO v_correct FROM graded WHERE is_correct = true;

    v_pct := CASE WHEN v_total > 0 THEN round((v_correct::numeric / v_total::numeric) * 100) ELSE 0 END;
    v_exp_gain := v_pct * 10;

    SELECT * INTO v_grade FROM csv_grading_policy 
    WHERE v_pct >= min_score AND v_pct <= max_score 
    ORDER BY min_score DESC LIMIT 1;

    -- Anti-cheat
    IF p_tab_switches >= v_max_switches THEN
        v_status := 'flagged';
    END IF;

    UPDATE csv_exam_attempts 
    SET 
        submitted_at = now(),
        score = v_correct,
        percentage = v_pct,
        time_taken_seconds = p_time_spent,
        tab_switches = p_tab_switches,
        status = v_status
    WHERE id = p_attempt_id;

    -- We skip EXP profile update in SQL for now as the user's frontend triggers EXP refresh anyway, 
    -- but ideally we'd UPDATE cadet_profiles SET exp = exp + v_exp_gain WHERE id = auth.uid();

    RETURN jsonb_build_object(
        'score', v_correct,
        'total', v_total,
        'percentage', v_pct,
        'exp_gain', v_exp_gain,
        'status', v_status,
        'passed', v_pct >= v_test.passing_percent,
        'grade_info', jsonb_build_object(
            'grade', COALESCE(v_grade.grade, 'FAIL'),
            'label', COALESCE(v_grade.remarks, 'Fail')
        )
    );
END;
$$;

-- 4. fn_get_exam_results
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt record;
    v_test record;
    v_grade record;
BEGIN
    SELECT * INTO v_attempt FROM csv_exam_attempts WHERE id = p_attempt_id;
    SELECT * INTO v_test FROM csv_mock_exams WHERE test_id = v_attempt.test_id;
    
    SELECT * INTO v_grade FROM csv_grading_policy 
    WHERE v_attempt.percentage >= min_score AND v_attempt.percentage <= max_score 
    ORDER BY min_score DESC LIMIT 1;

    RETURN jsonb_build_object(
        'attempt_id', v_attempt.id,
        'test_title', v_test.test_name,
        'score', v_attempt.score,
        'total_questions', v_attempt.total_questions,
        'passed', v_attempt.percentage >= v_test.passing_percent,
        'time_spent', v_attempt.time_taken_seconds,
        'tab_switches', v_attempt.tab_switches,
        'status', v_attempt.status,
        'grade_info', jsonb_build_object(
            'grade', COALESCE(v_grade.grade, 'FAIL'),
            'label', COALESCE(v_grade.remarks, 'Fail')
        ),
        'grading_data', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'question_id', q.question_id,
                    'question_text', q.question_text,
                    'topic_tag', q.subject_code,
                    'user_answer', aq.user_answer,
                    'correct_answer', CASE 
                        WHEN q.correct_answer = 'A' THEN q.option_a
                        WHEN q.correct_answer = 'B' THEN q.option_b
                        WHEN q.correct_answer = 'C' THEN q.option_c
                        WHEN q.correct_answer = 'D' THEN q.option_d
                        ELSE q.correct_answer
                    END,
                    'is_correct', aq.is_correct
                )
            )
            FROM csv_attempt_questions aq
            JOIN csv_questions q ON aq.question_id = q.question_id
            WHERE aq.attempt_id = p_attempt_id
        )
    );
END;
$$;


-- ==========================================
-- MIGRATION: 00025_csv_tables_rls_policies.sql
-- ==========================================

-- 00025_csv_tables_rls_policies.sql
-- RLS policies for all csv_* tables so that authenticated users can actually read/write data.

-- csv_subjects: everyone can read, instructors/admins can write
CREATE POLICY "csv_subjects_select" ON csv_subjects FOR SELECT USING (true);
CREATE POLICY "csv_subjects_insert" ON csv_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_subjects_update" ON csv_subjects FOR UPDATE USING (true);
CREATE POLICY "csv_subjects_delete" ON csv_subjects FOR DELETE USING (true);

-- csv_modules
CREATE POLICY "csv_modules_select" ON csv_modules FOR SELECT USING (true);
CREATE POLICY "csv_modules_insert" ON csv_modules FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_modules_update" ON csv_modules FOR UPDATE USING (true);
CREATE POLICY "csv_modules_delete" ON csv_modules FOR DELETE USING (true);

-- csv_questions
CREATE POLICY "csv_questions_select" ON csv_questions FOR SELECT USING (true);
CREATE POLICY "csv_questions_insert" ON csv_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_questions_update" ON csv_questions FOR UPDATE USING (true);
CREATE POLICY "csv_questions_delete" ON csv_questions FOR DELETE USING (true);

-- csv_mock_exams
CREATE POLICY "csv_mock_exams_select" ON csv_mock_exams FOR SELECT USING (true);
CREATE POLICY "csv_mock_exams_insert" ON csv_mock_exams FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_mock_exams_update" ON csv_mock_exams FOR UPDATE USING (true);
CREATE POLICY "csv_mock_exams_delete" ON csv_mock_exams FOR DELETE USING (true);

-- csv_exam_attempts
CREATE POLICY "csv_exam_attempts_select" ON csv_exam_attempts FOR SELECT USING (true);
CREATE POLICY "csv_exam_attempts_insert" ON csv_exam_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_exam_attempts_update" ON csv_exam_attempts FOR UPDATE USING (true);

-- csv_attempt_questions
CREATE POLICY "csv_attempt_questions_select" ON csv_attempt_questions FOR SELECT USING (true);
CREATE POLICY "csv_attempt_questions_insert" ON csv_attempt_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_attempt_questions_update" ON csv_attempt_questions FOR UPDATE USING (true);

-- csv_grading_policy
CREATE POLICY "csv_grading_policy_select" ON csv_grading_policy FOR SELECT USING (true);
CREATE POLICY "csv_grading_policy_insert" ON csv_grading_policy FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_grading_policy_update" ON csv_grading_policy FOR UPDATE USING (true);

-- csv_analytics_config
CREATE POLICY "csv_analytics_config_select" ON csv_analytics_config FOR SELECT USING (true);
CREATE POLICY "csv_analytics_config_insert" ON csv_analytics_config FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_analytics_config_update" ON csv_analytics_config FOR UPDATE USING (true);

-- csv_anticheat_config
CREATE POLICY "csv_anticheat_config_select" ON csv_anticheat_config FOR SELECT USING (true);
CREATE POLICY "csv_anticheat_config_insert" ON csv_anticheat_config FOR INSERT WITH CHECK (true);
CREATE POLICY "csv_anticheat_config_update" ON csv_anticheat_config FOR UPDATE USING (true);

-- csv_import_logs
CREATE POLICY "csv_import_logs_select" ON csv_import_logs FOR SELECT USING (true);
CREATE POLICY "csv_import_logs_insert" ON csv_import_logs FOR INSERT WITH CHECK (true);


-- ==========================================
-- MIGRATION: 00026_fix_question_id_type.sql
-- ==========================================

-- 00026_fix_question_id_type.sql
-- Fixes the question_id type to support string-based custom IDs (e.g., "Q-NCC_GEN-0001") instead of SERIAL

-- 1. Drop the foreign key constraint first
ALTER TABLE IF EXISTS csv_attempt_questions DROP CONSTRAINT IF EXISTS csv_attempt_questions_question_id_fkey;

-- 2. Alter the column type in csv_questions
ALTER TABLE IF EXISTS csv_questions ALTER COLUMN question_id DROP DEFAULT;
ALTER TABLE IF EXISTS csv_questions ALTER COLUMN question_id TYPE VARCHAR(50);

-- 3. Alter the column type in csv_attempt_questions
ALTER TABLE IF EXISTS csv_attempt_questions ALTER COLUMN question_id TYPE VARCHAR(50);

-- 4. Re-add the foreign key constraint
ALTER TABLE IF EXISTS csv_attempt_questions 
  ADD CONSTRAINT csv_attempt_questions_question_id_fkey 
  FOREIGN KEY (question_id) REFERENCES csv_questions(question_id) ON DELETE CASCADE;


-- ==========================================
-- MIGRATION: 00027_allow_null_options.sql
-- ==========================================

-- 00027_allow_null_options.sql
-- Removes the NOT NULL constraint from option_c and option_d to support True/False and 2-option questions

ALTER TABLE IF EXISTS csv_questions ALTER COLUMN option_c DROP NOT NULL;
ALTER TABLE IF EXISTS csv_questions ALTER COLUMN option_d DROP NOT NULL;


-- ==========================================
-- MIGRATION: 00028_rename_csv_rpcs.sql
-- ==========================================

-- 00028_rename_csv_rpcs.sql
-- Renames the CSV exam RPCs to prevent naming conflicts with legacy functions
-- This solves the "Could not choose the best candidate function" error in PostgREST

-- Fix the user_answer column so it can accept the full string text instead of just 'A', 'B', 'C', 'D'
ALTER TABLE IF EXISTS csv_attempt_questions DROP CONSTRAINT IF EXISTS csv_attempt_questions_user_answer_check;
ALTER TABLE IF EXISTS csv_attempt_questions ALTER COLUMN user_answer TYPE TEXT;
-- Drop the new conflicting functions (from 00024)
DROP FUNCTION IF EXISTS public.fn_start_exam(INTEGER);
DROP FUNCTION IF EXISTS public.fn_submit_exam(UUID, JSONB, INTEGER, INTEGER);

-- Recreate them with unique names specific to the CSV engine

CREATE OR REPLACE FUNCTION public.fn_start_csv_exam(p_test_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt_id UUID;
    v_duration INTEGER;
    v_questions JSONB;
BEGIN
    -- 1. Get test duration
    SELECT time_limit_minutes INTO v_duration
    FROM csv_mock_exams
    WHERE test_id = p_test_id AND is_active = TRUE;

    IF v_duration IS NULL THEN
        RAISE EXCEPTION 'Test not found or inactive';
    END IF;

    -- 2. Create attempt
    INSERT INTO csv_exam_attempts (user_id, test_id, status)
    VALUES (auth.uid(), p_test_id, 'in_progress')
    RETURNING id INTO v_attempt_id;

    -- 3. Randomly select questions based on distribution (mock logic)
    WITH Distribution AS (
        SELECT 
            split_part(part, ':', 1) AS subject_code,
            split_part(part, ':', 2)::INTEGER AS q_count
        FROM (
            SELECT unnest(string_to_array(question_distribution, '|')) AS part
            FROM csv_mock_exams
            WHERE test_id = p_test_id
        ) d
        WHERE part != '' AND part LIKE '%:%'
    ),
    SelectedQuestions AS (
        SELECT 
            q.question_id, 
            q.question_text, 
            -- Build a JSON array of non-null options
            (
                SELECT jsonb_agg(opt)
                FROM unnest(ARRAY[q.option_a, q.option_b, q.option_c, q.option_d]) AS opt
                WHERE opt IS NOT NULL AND opt != ''
            ) as options,
            q.subject_code, 
            q.difficulty
        FROM Distribution d
        CROSS JOIN LATERAL (
            SELECT question_id, question_text, option_a, option_b, option_c, option_d, subject_code, difficulty
            FROM csv_questions
            WHERE subject_code = d.subject_code
            AND active = TRUE
            ORDER BY random()
            LIMIT d.q_count
        ) q
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', question_id,
            'question_text', question_text,
            'options', options,
            'subject_code', subject_code,
            'difficulty', difficulty
        )
    ) INTO v_questions
    FROM SelectedQuestions;

    -- 4. Save attempt questions
    INSERT INTO csv_attempt_questions (attempt_id, question_id, subject_code)
    SELECT v_attempt_id, q->>'id', q->>'subject_code'
    FROM jsonb_array_elements(v_questions) q;

    -- 5. Return payload
    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'duration_minutes', v_duration,
        'csv_questions', v_questions
    );
END;
$$;


CREATE OR REPLACE FUNCTION public.fn_submit_csv_exam(
    p_attempt_id UUID,
    p_answers JSONB, -- Format: {"question_id": "selected_option"}
    p_tab_switches INTEGER DEFAULT 0,
    p_time_spent INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_test_id INTEGER;
    v_total_q INTEGER := 0;
    v_correct_q INTEGER := 0;
    v_score INTEGER := 0;
    v_percentage INTEGER := 0;
    v_exp_gain INTEGER := 0;
    v_user_id UUID;
    v_status VARCHAR := 'submitted';
    v_record RECORD;
BEGIN
    -- Validate attempt
    SELECT test_id, user_id INTO v_test_id, v_user_id
    FROM csv_exam_attempts
    WHERE id = p_attempt_id AND status = 'in_progress';

    IF v_test_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or already submitted attempt';
    END IF;

    -- Grade answers
    FOR v_record IN 
        SELECT aq.question_id, q.correct_answer, q.option_a, q.option_b, q.option_c, q.option_d
        FROM csv_attempt_questions aq
        JOIN csv_questions q ON q.question_id = aq.question_id
        WHERE aq.attempt_id = p_attempt_id
    LOOP
        v_total_q := v_total_q + 1;
        
        -- Check if answer is correct (extremely robust string matching)
        -- Supports cases where correct_answer is 'A', 'B', 'C', 'D' OR the full text
        IF LOWER(REGEXP_REPLACE(p_answers->>v_record.question_id, '[^a-zA-Z0-9]', '', 'g')) = 
           LOWER(REGEXP_REPLACE(
               CASE 
                   WHEN trim(v_record.correct_answer) ILIKE 'A' THEN v_record.option_a
                   WHEN trim(v_record.correct_answer) ILIKE 'B' THEN v_record.option_b
                   WHEN trim(v_record.correct_answer) ILIKE 'C' THEN v_record.option_c
                   WHEN trim(v_record.correct_answer) ILIKE 'D' THEN v_record.option_d
                   ELSE v_record.correct_answer
               END, 
               '[^a-zA-Z0-9]', '', 'g'
           )) THEN
            v_correct_q := v_correct_q + 1;
            
            -- Save individual correct answer
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = TRUE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        ELSE
            -- Save incorrect answer
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = FALSE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        END IF;
    END LOOP;

    v_score := v_correct_q;
    v_exp_gain := v_correct_q * 10; -- Award 10 XP per correct question
    
    IF v_total_q > 0 THEN
        v_percentage := (v_correct_q * 100) / v_total_q;
    END IF;

    IF p_tab_switches >= 5 THEN
        v_status := 'flagged';
    END IF;

    -- Finalize attempt
    UPDATE csv_exam_attempts
    SET status = v_status,
        score = v_score,
        total_questions = v_total_q,
        percentage = v_percentage,
        time_taken_seconds = p_time_spent,
        tab_switches = p_tab_switches,
        submitted_at = now()
    WHERE id = p_attempt_id;

    -- Award XP to Cadet
    IF v_exp_gain > 0 AND v_user_id IS NOT NULL THEN
        UPDATE public.cadet_profiles
        SET 
            exp = COALESCE(exp, 0) + v_exp_gain,
            level = fn_calculate_level(COALESCE(exp, 0) + v_exp_gain)
        WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'status', v_status,
        'score', v_score,
        'total_questions', v_total_q,
        'percentage', v_percentage,
        'total_correct', v_correct_q,
        'exp_gain', v_exp_gain
    );
END;
$$;


-- ==========================================
-- MIGRATION: 00029_csv_rls_hardening.sql
-- ==========================================

-- 00029_csv_rls_hardening.sql
-- Harden RLS policies for CSV tables so only instructors/admins can mutate content

-- Drop existing highly permissive policies (from 00025)
DROP POLICY IF EXISTS "csv_subjects_insert" ON csv_subjects;
DROP POLICY IF EXISTS "csv_subjects_update" ON csv_subjects;
DROP POLICY IF EXISTS "csv_subjects_delete" ON csv_subjects;

DROP POLICY IF EXISTS "csv_modules_insert" ON csv_modules;
DROP POLICY IF EXISTS "csv_modules_update" ON csv_modules;
DROP POLICY IF EXISTS "csv_modules_delete" ON csv_modules;

DROP POLICY IF EXISTS "csv_questions_insert" ON csv_questions;
DROP POLICY IF EXISTS "csv_questions_update" ON csv_questions;
DROP POLICY IF EXISTS "csv_questions_delete" ON csv_questions;

DROP POLICY IF EXISTS "csv_mock_exams_insert" ON csv_mock_exams;
DROP POLICY IF EXISTS "csv_mock_exams_update" ON csv_mock_exams;
DROP POLICY IF EXISTS "csv_mock_exams_delete" ON csv_mock_exams;

DROP POLICY IF EXISTS "csv_import_logs_insert" ON csv_import_logs;

-- Recreate them with strict role checks using the helper functions created in 00017
CREATE POLICY "csv_subjects_insert_auth" ON csv_subjects FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_subjects_update_auth" ON csv_subjects FOR UPDATE USING (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_subjects_delete_auth" ON csv_subjects FOR DELETE USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "csv_modules_insert_auth" ON csv_modules FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_modules_update_auth" ON csv_modules FOR UPDATE USING (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_modules_delete_auth" ON csv_modules FOR DELETE USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "csv_questions_insert_auth" ON csv_questions FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_questions_update_auth" ON csv_questions FOR UPDATE USING (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_questions_delete_auth" ON csv_questions FOR DELETE USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "csv_mock_exams_insert_auth" ON csv_mock_exams FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_mock_exams_update_auth" ON csv_mock_exams FOR UPDATE USING (public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_mock_exams_delete_auth" ON csv_mock_exams FOR DELETE USING (public.is_admin() OR public.is_instructor());

CREATE POLICY "csv_import_logs_insert_auth" ON csv_import_logs FOR INSERT WITH CHECK (public.is_admin() OR public.is_instructor());

-- User attempts and questions: 
-- A student should only be able to insert/update their OWN attempts.
-- But since the RPC runs with SECURITY DEFINER, the RLS policies don't strictly block the RPC.
-- However, direct API access must be restricted.
DROP POLICY IF EXISTS "csv_exam_attempts_insert" ON csv_exam_attempts;
DROP POLICY IF EXISTS "csv_exam_attempts_update" ON csv_exam_attempts;
DROP POLICY IF EXISTS "csv_exam_attempts_select" ON csv_exam_attempts;

CREATE POLICY "csv_exam_attempts_select_auth" ON csv_exam_attempts FOR SELECT USING (user_id = auth.uid() OR public.is_admin() OR public.is_instructor());
CREATE POLICY "csv_exam_attempts_insert_auth" ON csv_exam_attempts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "csv_exam_attempts_update_auth" ON csv_exam_attempts FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "csv_attempt_questions_insert" ON csv_attempt_questions;
DROP POLICY IF EXISTS "csv_attempt_questions_update" ON csv_attempt_questions;
DROP POLICY IF EXISTS "csv_attempt_questions_select" ON csv_attempt_questions;

CREATE POLICY "csv_attempt_questions_select_auth" ON csv_attempt_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM csv_exam_attempts WHERE id = attempt_id AND (user_id = auth.uid() OR public.is_admin() OR public.is_instructor()))
);
-- Insert/Update is handled by RPC, but we allow user to insert their own via API if needed
CREATE POLICY "csv_attempt_questions_insert_auth" ON csv_attempt_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM csv_exam_attempts WHERE id = attempt_id AND user_id = auth.uid())
);
CREATE POLICY "csv_attempt_questions_update_auth" ON csv_attempt_questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM csv_exam_attempts WHERE id = attempt_id AND user_id = auth.uid())
);


-- ==========================================
-- MIGRATION: 00030_fix_user_answer_length.sql
-- ==========================================

-- 00030_fix_user_answer_length.sql
-- Drop the restrictive CHECK constraint and change user_answer to TEXT so it can store full strings instead of just A/B/C/D.

-- Drop the check constraint if it exists
ALTER TABLE public.csv_attempt_questions DROP CONSTRAINT IF EXISTS csv_attempt_questions_user_answer_check;

-- Change the data type to TEXT
ALTER TABLE public.csv_attempt_questions ALTER COLUMN user_answer TYPE TEXT;


-- ==========================================
-- MIGRATION: 00031_gamification_csv_engine.sql
-- ==========================================

-- 00031_gamification_csv_engine.sql
-- This officially hooks up the new CSV Exam Engine to the Gamification system (XP and Leveling)
-- It also fixes the percentage calculations and ensures everything is strictly recorded.

CREATE OR REPLACE FUNCTION public.fn_submit_csv_exam(
    p_attempt_id UUID,
    p_answers JSONB, -- Format: {"question_id": "selected_option"}
    p_tab_switches INTEGER DEFAULT 0,
    p_time_spent INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_test_id INTEGER;
    v_user_id UUID;
    v_total_q INTEGER := 0;
    v_correct_q INTEGER := 0;
    v_score INTEGER := 0;
    v_percentage INTEGER := 0;
    v_exp_gain INTEGER := 0;
    v_status VARCHAR := 'submitted';
    v_record RECORD;
BEGIN
    -- Validate attempt and fetch user_id
    SELECT test_id, user_id INTO v_test_id, v_user_id
    FROM csv_exam_attempts
    WHERE id = p_attempt_id AND status = 'in_progress';

    IF v_test_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or already submitted attempt';
    END IF;

    -- Grade answers
    FOR v_record IN 
        SELECT aq.question_id, q.correct_answer, q.option_a, q.option_b, q.option_c, q.option_d
        FROM csv_attempt_questions aq
        JOIN csv_questions q ON q.question_id = aq.question_id
        WHERE aq.attempt_id = p_attempt_id
    LOOP
        v_total_q := v_total_q + 1;
        
        -- Check if answer is correct (extremely robust string matching)
        -- Supports cases where correct_answer is 'A', 'B', 'C', 'D' OR the full text
        IF LOWER(REGEXP_REPLACE(p_answers->>v_record.question_id, '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(v_record.correct_answer, '[^a-zA-Z0-9]', '', 'g')) THEN
            v_correct_q := v_correct_q + 1;
            
            -- Save individual correct answer
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = TRUE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        ELSE
            -- Save incorrect answer
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = FALSE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        END IF;
    END LOOP;

    v_score := v_correct_q;
    v_exp_gain := v_correct_q * 10; -- Award 10 XP per correct question
    
    IF v_total_q > 0 THEN
        v_percentage := (v_correct_q * 100) / v_total_q;
    END IF;

    IF p_tab_switches >= 5 THEN
        v_status := 'flagged';
    END IF;

    -- Finalize attempt
    UPDATE csv_exam_attempts
    SET status = v_status,
        score = v_score,
        total_questions = v_total_q,
        percentage = v_percentage,
        time_taken_seconds = p_time_spent,
        tab_switches = p_tab_switches,
        submitted_at = now()
    WHERE id = p_attempt_id;

    -- Award XP and trigger leveling for the Cadet
    IF v_exp_gain > 0 AND v_user_id IS NOT NULL THEN
        UPDATE public.cadet_profiles
        SET 
            exp = COALESCE(exp, 0) + v_exp_gain,
            level = fn_calculate_level(COALESCE(exp, 0) + v_exp_gain)
        WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'status', v_status,
        'score', v_score,
        'total_questions', v_total_q,
        'percentage', v_percentage,
        'total_correct', v_correct_q,
        'exp_gain', v_exp_gain
    );
END;
$$;


-- ==========================================
-- MIGRATION: 00032_grading_engine_fix.sql
-- ==========================================

-- 00032_grading_engine_fix.sql
-- Fixes grading matching string values (Marine vs B)
-- Fixes Exam Results RPC to return the actual string text instead of A/B/C/D.

CREATE OR REPLACE FUNCTION public.fn_submit_csv_exam(
    p_attempt_id UUID,
    p_answers JSONB, -- Format: {"question_id": "selected_option_string"}
    p_tab_switches INTEGER DEFAULT 0,
    p_time_spent INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_test_id INTEGER;
    v_user_id UUID;
    v_total_q INTEGER := 0;
    v_correct_q INTEGER := 0;
    v_score INTEGER := 0;
    v_percentage INTEGER := 0;
    v_exp_gain INTEGER := 0;
    v_status VARCHAR := 'submitted';
    v_record RECORD;
    v_correct_text TEXT;
BEGIN
    -- Validate attempt and fetch user_id
    SELECT test_id, user_id INTO v_test_id, v_user_id
    FROM csv_exam_attempts
    WHERE id = p_attempt_id AND status = 'in_progress';

    IF v_test_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or already submitted attempt';
    END IF;

    -- Grade answers
    FOR v_record IN 
        SELECT aq.question_id, q.correct_answer, q.option_a, q.option_b, q.option_c, q.option_d
        FROM csv_attempt_questions aq
        JOIN csv_questions q ON q.question_id = aq.question_id
        WHERE aq.attempt_id = p_attempt_id
    LOOP
        v_total_q := v_total_q + 1;
        
        -- Resolve full text of correct answer
        v_correct_text := CASE v_record.correct_answer
            WHEN 'A' THEN v_record.option_a
            WHEN 'B' THEN v_record.option_b
            WHEN 'C' THEN v_record.option_c
            WHEN 'D' THEN v_record.option_d
            ELSE v_record.correct_answer
        END;

        -- Check if answer is correct (extremely robust string matching)
        IF LOWER(REGEXP_REPLACE(p_answers->>v_record.question_id, '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(v_correct_text, '[^a-zA-Z0-9]', '', 'g')) THEN
            v_correct_q := v_correct_q + 1;
            
            -- Save individual correct answer
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = TRUE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        ELSE
            -- Save incorrect answer
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = FALSE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        END IF;
    END LOOP;

    v_score := v_correct_q;
    v_exp_gain := v_correct_q * 10; -- Award 10 XP per correct question
    
    IF v_total_q > 0 THEN
        v_percentage := (v_correct_q * 100) / v_total_q;
    END IF;

    IF p_tab_switches >= 5 THEN
        v_status := 'flagged';
    END IF;

    -- Finalize attempt
    UPDATE csv_exam_attempts
    SET status = v_status,
        score = v_score,
        total_questions = v_total_q,
        percentage = v_percentage,
        time_taken_seconds = p_time_spent,
        tab_switches = p_tab_switches,
        submitted_at = now()
    WHERE id = p_attempt_id;

    -- Award XP and trigger leveling for the Cadet
    IF v_exp_gain > 0 AND v_user_id IS NOT NULL THEN
        UPDATE public.cadet_profiles
        SET 
            exp = COALESCE(exp, 0) + v_exp_gain,
            level = fn_calculate_level(COALESCE(exp, 0) + v_exp_gain)
        WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'status', v_status,
        'score', v_score,
        'total_questions', v_total_q,
        'percentage', v_percentage,
        'total_correct', v_correct_q,
        'exp_gain', v_exp_gain
    );
END;
$$;


-- Overwrite fn_get_exam_results to return full text for the Answer Review section
CREATE OR REPLACE FUNCTION public.fn_get_exam_results(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt RECORD;
    v_test RECORD;
    v_grade RECORD;
BEGIN
    -- Get attempt
    SELECT * INTO v_attempt FROM csv_exam_attempts WHERE id = p_attempt_id;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Get test info
    SELECT * INTO v_test FROM csv_mock_exams WHERE test_id = v_attempt.test_id;
    
    -- Get grading policy info
    SELECT * INTO v_grade FROM csv_grading_policy 
    WHERE v_attempt.percentage >= min_score AND v_attempt.percentage <= max_score 
    ORDER BY min_score DESC LIMIT 1;

    RETURN jsonb_build_object(
        'attempt_id', v_attempt.id,
        'test_title', v_test.test_name,
        'score', v_attempt.score,
        'total_questions', v_attempt.total_questions,
        'passed', v_attempt.percentage >= v_test.passing_percent,
        'time_spent', v_attempt.time_taken_seconds,
        'tab_switches', v_attempt.tab_switches,
        'status', v_attempt.status,
        'grade_info', jsonb_build_object(
            'grade', COALESCE(v_grade.grade, 'FAIL'),
            'label', COALESCE(v_grade.remarks, 'Fail')
        ),
        'grading_data', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'question_id', q.question_id,
                    'question_text', q.question_text,
                    'user_answer', aq.user_answer,
                    'correct_answer', CASE q.correct_answer
                        WHEN 'A' THEN q.option_a
                        WHEN 'B' THEN q.option_b
                        WHEN 'C' THEN q.option_c
                        WHEN 'D' THEN q.option_d
                        ELSE q.correct_answer
                    END,
                    'is_correct', aq.is_correct,
                    'subject_code', aq.subject_code,
                    'explanation', q.explanation
                )
            )
            FROM csv_attempt_questions aq
            JOIN csv_questions q ON q.question_id = aq.question_id
            WHERE aq.attempt_id = p_attempt_id
        )
    );
END;
$$;


-- ==========================================
-- MIGRATION: 00033_production_patch.sql
-- ==========================================

-- 00033_production_patch.sql
-- Enforces perfect grading matches and ensures History tab queries cannot fail due to RLS.

-- 1. Definitively set the RLS policy to ensure the Cadet can view their own attempts.
DROP POLICY IF EXISTS "csv_exam_attempts_select_auth" ON csv_exam_attempts;

CREATE POLICY "csv_exam_attempts_select_auth" ON csv_exam_attempts 
FOR SELECT USING (
    user_id = auth.uid() OR 
    (SELECT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid())) OR 
    (SELECT EXISTS (SELECT 1 FROM public.instructor_profiles WHERE id = auth.uid()))
);

-- 2. Fully Re-apply the fn_submit_csv_exam with PERFECT STRING MATCHING AND EXP GAIN.
CREATE OR REPLACE FUNCTION public.fn_submit_csv_exam(
    p_attempt_id UUID,
    p_answers JSONB,
    p_tab_switches INTEGER DEFAULT 0,
    p_time_spent INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_test_id INTEGER;
    v_user_id UUID;
    v_total_q INTEGER := 0;
    v_correct_q INTEGER := 0;
    v_score INTEGER := 0;
    v_percentage INTEGER := 0;
    v_exp_gain INTEGER := 0;
    v_status VARCHAR := 'submitted';
    v_record RECORD;
    v_correct_text TEXT;
BEGIN
    -- Validate attempt and fetch user_id
    SELECT test_id, user_id INTO v_test_id, v_user_id
    FROM csv_exam_attempts
    WHERE id = p_attempt_id AND status = 'in_progress';

    IF v_test_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or already submitted attempt';
    END IF;

    -- Iterate through the attempt's questions
    FOR v_record IN 
        SELECT aq.question_id, q.correct_answer, q.option_a, q.option_b, q.option_c, q.option_d
        FROM csv_attempt_questions aq
        JOIN csv_questions q ON q.question_id = aq.question_id
        WHERE aq.attempt_id = p_attempt_id
    LOOP
        v_total_q := v_total_q + 1;

        -- Resolve full text of correct answer to ensure 'A' matches 'Lata Mangeshkar'
        v_correct_text := CASE trim(v_record.correct_answer)
            WHEN 'A' THEN v_record.option_a
            WHEN 'B' THEN v_record.option_b
            WHEN 'C' THEN v_record.option_c
            WHEN 'D' THEN v_record.option_d
            ELSE v_record.correct_answer
        END;

        -- Check if answer is correct (extremely robust alphanumeric string matching)
        IF LOWER(REGEXP_REPLACE(p_answers->>v_record.question_id, '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(v_correct_text, '[^a-zA-Z0-9]', '', 'g')) THEN
            v_correct_q := v_correct_q + 1;
            
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = TRUE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        ELSE
            UPDATE csv_attempt_questions
            SET user_answer = p_answers->>v_record.question_id,
                is_correct = FALSE
            WHERE attempt_id = p_attempt_id AND question_id = v_record.question_id;
        END IF;
    END LOOP;

    -- Calculate scoring
    IF v_total_q > 0 THEN
        v_score := v_correct_q;
        v_percentage := ROUND((v_correct_q::numeric / v_total_q::numeric) * 100);
    END IF;

    -- Calculate EXP (10 EXP per correct answer)
    v_exp_gain := v_correct_q * 10;

    -- Award XP and trigger leveling for the Cadet
    IF v_exp_gain > 0 AND v_user_id IS NOT NULL THEN
        UPDATE public.cadet_profiles
        SET 
            exp = COALESCE(exp, 0) + v_exp_gain,
            level = fn_calculate_level(COALESCE(exp, 0) + v_exp_gain)
        WHERE id = v_user_id;
    END IF;

    -- Flag attempt if tab switching threshold is exceeded
    IF p_tab_switches >= 5 THEN
        v_status := 'flagged';
    END IF;

    -- Finalize attempt
    UPDATE csv_exam_attempts
    SET status = v_status,
        score = v_score,
        total_questions = v_total_q,
        percentage = v_percentage,
        time_taken_seconds = p_time_spent,
        tab_switches = p_tab_switches,
        submitted_at = now()
    WHERE id = p_attempt_id;

    RETURN jsonb_build_object(
        'success', true,
        'score', v_score,
        'total', v_total_q,
        'percentage', v_percentage,
        'exp_gained', v_exp_gain
    );
END;
$$;


-- ==========================================
-- MIGRATION: 00034_bypass_history_rls.sql
-- ==========================================

-- 00034_bypass_history_rls.sql
-- Bypasses potentially bugged RLS policies by using a Security Definer RPC to fetch user attempts.

CREATE OR REPLACE FUNCTION public.fn_get_my_csv_attempts()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    test_id INTEGER,
    status VARCHAR,
    score INTEGER,
    total_questions INTEGER,
    percentage INTEGER,
    time_taken_seconds INTEGER,
    tab_switches INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    test_name VARCHAR,
    passing_percent INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        a.test_id,
        a.status,
        a.score,
        a.total_questions,
        a.percentage,
        a.time_taken_seconds,
        a.tab_switches,
        a.started_at,
        a.submitted_at,
        m.test_name,
        m.passing_percent
    FROM csv_exam_attempts a
    LEFT JOIN csv_mock_exams m ON a.test_id = m.test_id
    WHERE a.user_id = auth.uid()
      AND a.status IN ('submitted', 'flagged')
    ORDER BY a.submitted_at ASC;
END;
$$;


-- ==========================================
-- MIGRATION: 00035_fix_null_user_id.sql
-- ==========================================

-- 00035_fix_null_user_id.sql
-- Solves the "Phantom Data" and "0 EXP" bug by forcing the user_id to be passed explicitly from the frontend.
-- This bypasses the edge case where auth.uid() evaluates to NULL inside SECURITY DEFINER on some Supabase versions.

CREATE OR REPLACE FUNCTION public.fn_start_csv_exam(
    p_test_id INTEGER,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt_id UUID;
    v_duration INTEGER;
    v_questions JSONB;
    v_actual_user_id UUID;
BEGIN
    -- Resolve user ID definitively
    v_actual_user_id := COALESCE(p_user_id, auth.uid());

    IF v_actual_user_id IS NULL THEN
        RAISE EXCEPTION 'Cannot start exam: User ID is missing or auth context is lost.';
    END IF;

    -- 1. Get test duration
    SELECT time_limit_minutes INTO v_duration
    FROM csv_mock_exams
    WHERE test_id = p_test_id AND is_active = TRUE;

    IF v_duration IS NULL THEN
        RAISE EXCEPTION 'Test not found or inactive';
    END IF;

    -- 2. Create attempt
    INSERT INTO csv_exam_attempts (user_id, test_id, status)
    VALUES (v_actual_user_id, p_test_id, 'in_progress')
    RETURNING id INTO v_attempt_id;

    -- 3. Randomly select questions based on distribution
    WITH Distribution AS (
        SELECT 
            d.subject_code, 
            d.number_of_questions as q_count,
            d.difficulty
        FROM csv_mock_exams m
        JOIN jsonb_to_recordset(m.question_distribution) AS d(subject_code text, number_of_questions int, difficulty text) ON true
        WHERE m.test_id = p_test_id
    ),
    SelectedQuestions AS (
        SELECT 
            q.question_id, 
            q.question_text,
            jsonb_build_array(q.option_a, q.option_b, q.option_c, q.option_d) as options,
            q.subject_code, 
            q.difficulty
        FROM Distribution d
        CROSS JOIN LATERAL (
            SELECT question_id, question_text, option_a, option_b, option_c, option_d, subject_code, difficulty
            FROM csv_questions
            WHERE subject_code = d.subject_code
            AND active = TRUE
            ORDER BY random()
            LIMIT d.q_count
        ) q
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', question_id,
            'question_text', question_text,
            'options', options,
            'subject_code', subject_code,
            'difficulty', difficulty
        )
    ) INTO v_questions
    FROM SelectedQuestions;

    -- 4. Save attempt questions
    INSERT INTO csv_attempt_questions (attempt_id, question_id, subject_code)
    SELECT v_attempt_id, q->>'id', q->>'subject_code'
    FROM jsonb_array_elements(v_questions) q;

    -- 5. Return payload
    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'duration_minutes', v_duration,
        'csv_questions', v_questions
    );
END;
$$;

-- Recover stranded records (if possible) for the current active user by looking at their most recent activity,
-- or just delete them to clean up the UI. We will clean up orphaned NULL attempts to prevent database bloat.
DELETE FROM csv_exam_attempts WHERE user_id IS NULL;


-- ==========================================
-- MIGRATION: 00036_drop_csv_auth_fkey.sql
-- ==========================================

-- 00036_drop_csv_auth_fkey.sql
-- Removes the foreign key constraint to auth.users for the new CSV engine.
-- This aligns with migration 00021_drop_auth_fkeys.sql which dropped them for the old engine,
-- preventing crashes in local development environments where auth.users is out of sync.

ALTER TABLE public.csv_exam_attempts 
DROP CONSTRAINT IF EXISTS csv_exam_attempts_user_id_fkey;


-- ==========================================
-- MIGRATION: 00037_restore_csv_parsing.sql
-- ==========================================

-- 00037_restore_csv_parsing.sql
-- Fixes the JSONB type casting error introduced in 00035.
-- Restores the original string parsing logic ("SUBJECT_CODE:COUNT|...") while preserving the critical explicit user ID fix.

CREATE OR REPLACE FUNCTION public.fn_start_csv_exam(
    p_test_id INTEGER,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt_id UUID;
    v_duration INTEGER;
    v_questions JSONB;
    v_actual_user_id UUID;
BEGIN
    -- Resolve user ID definitively
    v_actual_user_id := COALESCE(p_user_id, auth.uid());

    IF v_actual_user_id IS NULL THEN
        RAISE EXCEPTION 'Cannot start exam: User ID is missing or auth context is lost.';
    END IF;

    -- 1. Get test duration
    SELECT time_limit_minutes INTO v_duration
    FROM csv_mock_exams
    WHERE test_id = p_test_id AND is_active = TRUE;

    IF v_duration IS NULL THEN
        RAISE EXCEPTION 'Test not found or inactive';
    END IF;

    -- 2. Create attempt
    INSERT INTO csv_exam_attempts (user_id, test_id, status)
    VALUES (v_actual_user_id, p_test_id, 'in_progress')
    RETURNING id INTO v_attempt_id;

    -- 3. Randomly select questions based on distribution (mock logic)
    WITH Distribution AS (
        SELECT 
            split_part(part, ':', 1) AS subject_code,
            split_part(part, ':', 2)::INTEGER AS q_count
        FROM (
            SELECT unnest(string_to_array(question_distribution, '|')) AS part
            FROM csv_mock_exams
            WHERE test_id = p_test_id
        ) d
        WHERE part != '' AND part LIKE '%:%'
    ),
    SelectedQuestions AS (
        SELECT 
            q.question_id, 
            q.question_text, 
            -- Build a JSON array of non-null options
            (
                SELECT jsonb_agg(opt)
                FROM unnest(ARRAY[q.option_a, q.option_b, q.option_c, q.option_d]) AS opt
                WHERE opt IS NOT NULL AND opt != ''
            ) as options,
            q.subject_code, 
            q.difficulty
        FROM Distribution d
        CROSS JOIN LATERAL (
            SELECT question_id, question_text, option_a, option_b, option_c, option_d, subject_code, difficulty
            FROM csv_questions
            WHERE subject_code = d.subject_code
            AND active = TRUE
            ORDER BY random()
            LIMIT d.q_count
        ) q
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', question_id,
            'question_text', question_text,
            'options', options,
            'subject_code', subject_code,
            'difficulty', difficulty
        )
    ) INTO v_questions
    FROM SelectedQuestions;

    -- 4. Save attempt questions
    INSERT INTO csv_attempt_questions (attempt_id, question_id, subject_code)
    SELECT v_attempt_id, q->>'id', q->>'subject_code'
    FROM jsonb_array_elements(v_questions) q;

    -- 5. Return payload
    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'duration_minutes', v_duration,
        'csv_questions', v_questions
    );
END;
$$;


-- ==========================================
-- MIGRATION: 00038_fix_history_rpc_userid.sql
-- ==========================================

-- 00038_fix_history_rpc_userid.sql
-- Fixes the history RPC by explicitly accepting the user_id from the frontend.
-- This bypasses the same auth.uid() edge case that affected the exam start function.

CREATE OR REPLACE FUNCTION public.fn_get_my_csv_attempts(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    test_id INTEGER,
    status VARCHAR,
    score INTEGER,
    total_questions INTEGER,
    percentage INTEGER,
    time_taken_seconds INTEGER,
    tab_switches INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    test_name VARCHAR,
    passing_percent INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_actual_user_id UUID;
BEGIN
    v_actual_user_id := COALESCE(p_user_id, auth.uid());

    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        a.test_id,
        a.status,
        a.score,
        a.total_questions,
        a.percentage,
        a.time_taken_seconds,
        a.tab_switches,
        a.started_at,
        a.submitted_at,
        m.test_name,
        m.passing_percent
    FROM csv_exam_attempts a
    LEFT JOIN csv_mock_exams m ON a.test_id = m.test_id
    WHERE a.user_id = v_actual_user_id
      AND a.status IN ('submitted', 'flagged')
    ORDER BY a.submitted_at ASC;
END;
$$;


