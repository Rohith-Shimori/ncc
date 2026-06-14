const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const Papa = require('papaparse');

// 1. Read environment variables from .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseAnonKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function parseCsvFile(fileName) {
  const filePath = path.join(__dirname, 'public', 'data', fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: true
  });
  return parsed.data;
}

async function run() {
  console.log('Signing in to Supabase...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@ncc.gov.in',
    password: 'Admin@123'
  });

  if (authError) {
    console.error('Authentication failed:', authError.message);
    process.exit(1);
  }

  console.log('Authenticated successfully. User ID:', authData.user.id);
  supabase.auth.setSession(authData.session);

  // 1. Seed subjects
  console.log('Parsing and seeding subjects...');
  const subjects = parseCsvFile('subject_codes.csv').map(row => ({
    subject_code: row.subject_code,
    subject_name: row.subject_name,
    description: row.description || `${row.subject_name} course`
  }));
  const { error: errSub } = await supabase.from('csv_subjects').upsert(subjects, { onConflict: 'subject_code' });
  if (errSub) { console.error('Error seeding subjects:', errSub); process.exit(1); }

  // 2. Seed modules
  console.log('Parsing and seeding modules...');
  const modules = parseCsvFile('modules.csv').map(row => ({
    id: parseInt(row.module_id.replace('MOD-', ''), 10) || parseInt(row.module_id, 10),
    subject_code: row.subject_code,
    module_number: parseInt(row.order_in_course, 10),
    module_name: row.module_name
  }));
  const { error: errMod } = await supabase.from('csv_modules').upsert(modules, { onConflict: 'id' });
  if (errMod) { console.error('Error seeding modules:', errMod); process.exit(1); }

  // 3. Seed questions
  console.log('Parsing and seeding questions...');
  const questions = parseCsvFile('question_bank_master.csv').map(row => ({
    question_id: row.question_id,
    subject_code: row.subject_code,
    module_number: parseInt(row.module_number, 10) || null,
    difficulty: parseInt(row.difficulty, 10) || 1,
    question_text: row.question_text,
    option_a: row.option_a,
    option_b: row.option_b,
    option_c: row.option_c || null,
    option_d: row.option_d || null,
    correct_answer: row.correct_answer,
    explanation: row.explanation || null,
    active: row.active ? row.active.toUpperCase() === 'TRUE' : true,
    certificate: row.certificate || 'Common',
    wing: row.wing || 'Common'
  }));

  // Chunk questions to prevent payload size limits
  for (let i = 0; i < questions.length; i += 100) {
    const chunk = questions.slice(i, i + 100);
    const { error: errQ } = await supabase.from('csv_questions').upsert(chunk, { onConflict: 'question_id' });
    if (errQ) { console.error(`Error seeding questions chunk ${i}-${i+100}:`, errQ); process.exit(1); }
  }

  // 4. Seed mock exams
  console.log('Parsing and seeding mock exams...');
  const exams = parseCsvFile('practice_tests.csv').map(row => {
    // Normalise wing names from uppercase to titlecase
    let wing = row.wing;
    if (wing === 'ALL' || wing === 'Common') wing = 'Common';
    else if (wing === 'ARMY') wing = 'Army';
    else if (wing === 'NAVY') wing = 'Navy';
    else if (wing === 'AIR') wing = 'Air Force';

    return {
      test_id: row.test_id,
      test_name: row.test_name,
      wing: wing,
      certificate_level: row.certificate,
      time_limit_minutes: parseInt(row.time_limit_minutes, 10) || 60,
      passing_percent: parseInt(row.passing_percent, 10) || 60,
      question_distribution: row.question_distribution,
      is_active: row.is_active ? row.is_active.toUpperCase() === 'TRUE' : true
    };
  });
  const { error: errExams } = await supabase.from('csv_mock_exams').upsert(exams, { onConflict: 'test_id' });
  if (errExams) { console.error('Error seeding mock exams:', errExams); process.exit(1); }

  console.log('CSV tables successfully seeded on remote database!');
}

run();
