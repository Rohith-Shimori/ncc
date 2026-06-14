// check_supabase.cjs
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://czyjaeszmnyiwjilkhls.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eWphZXN6bW55aXdqaWxraGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNTk1NjgsImV4cCI6MjA5NjczNTU2OH0.836ZD1zEuylPNR13sajLkhmccsVFMJXLUWPuy7b4IqQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('--- Checking Supabase connection and tables ---');
  try {
    const { data: courses, error: errCourses } = await supabase.from('courses').select('id, title, target_wing, certificate_level').limit(5);
    console.log('Courses count check:', errCourses ? 'Error: ' + errCourses.message : `Success! Found courses: ${courses?.length}`);
    if (courses?.length) console.log('Sample courses:', courses);

    const { data: csvExams, error: errExams } = await supabase.from('csv_mock_exams').select('test_id, test_name, wing, certificate_level').limit(5);
    console.log('CSV mock exams count check:', errExams ? 'Error: ' + errExams.message : `Success! Found mock exams: ${csvExams?.length}`);
    if (csvExams?.length) console.log('Sample mock exams:', csvExams);

    const { data: announcements, error: errAnns } = await supabase.from('announcements').select('id, title, target_wing, is_active').limit(5);
    console.log('Announcements count check:', errAnns ? 'Error: ' + errAnns.message : `Success! Found announcements: ${announcements?.length}`);
    if (announcements?.length) console.log('Sample announcements:', announcements);

    const { data: profiles, error: errProfiles } = await supabase.from('cadet_profiles').select('id, full_name, wing, certificate_level').limit(5);
    console.log('Cadet profiles count check:', errProfiles ? 'Error: ' + errProfiles.message : `Success! Found profiles: ${profiles?.length}`);
    if (profiles?.length) console.log('Sample profiles:', profiles);

  } catch (err) {
    console.error('Fatal error during query execution:', err);
  }
}

run();
