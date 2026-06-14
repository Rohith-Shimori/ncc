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
