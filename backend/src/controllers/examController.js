const { supabase, getSupabaseClient } = require('../config/supabase');
const { sendInAppAlert } = require('../config/socket');
const { sendEmailAlert } = require('../config/email');

const getAttempts = async (req, res) => {
  try {
    const user_id = req.user.id;
    const userRole = req.user.user_metadata?.role || 'cadet';
    const client = getSupabaseClient(req.token);

    let query = client
      .from('csv_exam_attempts')
      .select('*, cadet_profiles(full_name), csv_mock_exams(test_name)');

    if (userRole === 'cadet') {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json({ data, error: null });
  } catch (error) {
    console.error('[Exam Controller] Error fetching exam attempts:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

const submitExam = async (req, res) => {
  try {
    const { attempt_id, answers, tab_switches, time_spent } = req.body;
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);

    // 1. Call the database RPC using authenticated client context
    const { data: submitResult, error: submitError } = await client
      .rpc('fn_submit_csv_exam', {
        p_attempt_id: attempt_id,
        p_answers: answers || {},
        p_tab_switches: tab_switches || 0,
        p_time_spent: time_spent || 0
      });

    if (submitError) throw submitError;

    // 2. Fetch attempt details
    const { data: attempt, error: attemptError } = await client
      .from('csv_exam_attempts')
      .select('*')
      .eq('id', attempt_id)
      .single();

    if (attemptError) throw attemptError;

    // 3. Fetch mock exam name
    const { data: mockExam } = await client
      .from('csv_mock_exams')
      .select('test_name')
      .eq('test_id', attempt.test_id)
      .maybeSingle();

    const testName = mockExam ? mockExam.test_name : 'Mock Exam';

    // 4. Fetch cadet profile details
    const { data: cadetProfile } = await client
      .from('cadet_profiles')
      .select('full_name')
      .eq('id', user_id)
      .single();

    const cadetName = cadetProfile ? cadetProfile.full_name : 'Cadet';

    // 5. Fetch cadet email
    const { data: cadetEmail } = await client
      .rpc('fn_get_user_email', { p_user_id: user_id });

    // 6. Handle Notifications and WebSocket events
    if (submitResult.status === 'flagged') {
      const { data: instructors } = await client.rpc('fn_get_all_instructors');
      
      if (instructors && instructors.length > 0) {
        for (const inst of instructors) {
          const notif = {
            user_id: inst.id,
            type: 'exam',
            title: `⚠️ Flagged Exam: ${cadetName}`,
            content: `${cadetName} flagged during "${testName}" with ${tab_switches} tab switches.`,
            link: '/dashboard',
            is_read: false
          };

          const { data: createdNotif } = await client
            .from('notifications')
            .insert(notif)
            .select()
            .single();

          if (createdNotif) {
            sendInAppAlert(inst.id, createdNotif);
          }

          if (inst.email) {
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff;">
                <h2 style="color: #ef4444; text-align: center;">NCC Exam Security Alert</h2>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p>Hello Instructor <strong>${inst.full_name}</strong>,</p>
                <p>A cadet's exam attempt has been <strong>flagged by the anti-cheat system</strong>:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                  <tr style="background-color: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Cadet Name:</td><td style="padding: 8px;">${cadetName}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold;">Exam Name:</td><td style="padding: 8px;">${testName}</td></tr>
                  <tr style="background-color: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Tab Switches:</td><td style="padding: 8px; color: #ef4444; font-weight: bold;">${tab_switches}</td></tr>
                  <tr><td style="padding: 8px; font-weight: bold;">Time Taken:</td><td style="padding: 8px;">${Math.floor(time_spent / 60)}m ${time_spent % 60}s</td></tr>
                </table>
                <p>The result is currently locked. Please log in to the NCC Digital Training Portal to review the attempt details.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="text-align: center;"><a href="http://localhost:5173/dashboard" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Attempt</a></p>
              </div>
            `;
            sendEmailAlert({ to: inst.email, subject: `⚠️ SECURITY FLAG: ${cadetName} - ${testName}`, html: emailHtml }).catch(err => {
              console.error('[Exam Controller] Email send failed for instructor', inst.email, err);
            });
          }
        }
      }

      const cadetNotif = {
        user_id: user_id,
        type: 'exam',
        title: `⚠️ Exam Flagged for Review`,
        content: `Your attempt for "${testName}" has been flagged due to tab switches. It is under instructor review.`,
        link: '/dashboard',
        is_read: false
      };

      const { data: createdCadetNotif } = await client
        .from('notifications')
        .insert(cadetNotif)
        .select()
        .single();

      if (createdCadetNotif) {
        sendInAppAlert(user_id, createdCadetNotif);
      }

      if (cadetEmail) {
        const cadetEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff5f5;">
            <h2 style="color: #c53030; text-align: center;">Exam Flagged</h2>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <p>Dear Cadet <strong>${cadetName}</strong>,</p>
            <p>Your recent submission for <strong>${testName}</strong> has been flagged by the system due to browser tab switches during the test.</p>
            <p><strong>Status:</strong> Under Instructor Review</p>
            <p>Your score and results will be released once the instructor completes their review.</p>
            <p style="font-size: 12px; color: #718096; margin-top: 20px;">If this was an error, please coordinate with your unit instructor.</p>
          </div>
        `;
        sendEmailAlert({ to: cadetEmail, subject: `⚠️ Exam Flagged: ${testName}`, html: cadetEmailHtml }).catch(err => {
          console.error('[Exam Controller] Email send failed for cadet', cadetEmail, err);
        });
      }

    } else {
      const cadetNotif = {
        user_id: user_id,
        type: 'exam',
        title: `🎖️ Exam Graded: ${testName}`,
        content: `You scored ${submitResult.percentage}% (${submitResult.score}/${submitResult.total_questions}) and earned ${submitResult.exp_gain} EXP.`,
        link: `/dashboard`,
        is_read: false
      };

      const { data: createdCadetNotif } = await client
        .from('notifications')
        .insert(cadetNotif)
        .select()
        .single();

      if (createdCadetNotif) {
        sendInAppAlert(user_id, createdCadetNotif);
      }

      if (cadetEmail) {
        const isPassed = submitResult.percentage >= 60;
        const cadetEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9fafb;">
            <h2 style="color: #1a56db; text-align: center;">NCC Exam Result</h2>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <p>Dear Cadet <strong>${cadetName}</strong>,</p>
            <p>Congratulations on completing your exam <strong>${testName}</strong>. Your performance details are below:</p>
            <div style="background-color: ${isPassed ? '#f0fdf4' : '#fef2f2'}; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid ${isPassed ? '#bbf7d0' : '#fecaca'}; text-align: center;">
              <h3 style="margin: 0; color: ${isPassed ? '#16a34a' : '#dc2626'};">${isPassed ? 'PASSED' : 'FAILED'}</h3>
              <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #111827;">${submitResult.percentage}%</p>
              <p style="margin: 0; color: #4b5563;">Score: ${submitResult.score} / ${submitResult.total_questions} correct answers</p>
              <p style="margin: 5px 0 0 0; color: #0284c7; font-weight: bold;">+${submitResult.exp_gain} EXP Earned</p>
            </div>
            <p style="text-align: center;"><a href="http://localhost:5173/dashboard" style="background-color: #1a56db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a></p>
          </div>
        `;
        sendEmailAlert({ to: cadetEmail, subject: `🎖️ Exam Result: ${testName} (${submitResult.percentage}%)`, html: cadetEmailHtml }).catch(err => {
          console.error('[Exam Controller] Email send failed for cadet', cadetEmail, err);
        });
      }

      const { data: instructors } = await client.rpc('fn_get_all_instructors');
      if (instructors && instructors.length > 0) {
        for (const inst of instructors) {
          const instNotif = {
            user_id: inst.id,
            type: 'exam',
            title: `📝 Exam Submitted: ${cadetName}`,
            content: `${cadetName} scored ${submitResult.percentage}% on "${testName}".`,
            link: '/dashboard',
            is_read: false
          };

          const { data: createdInstNotif } = await client
            .from('notifications')
            .insert(instNotif)
            .select()
            .single();

          if (createdInstNotif) {
            sendInAppAlert(inst.id, createdInstNotif);
          }
        }
      }
    }

    res.json({ data: submitResult, error: null });
  } catch (error) {
    console.error('[Exam Controller] Error submitting exam:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

const releaseResult = async (req, res) => {
  try {
    const { attempt_id } = req.body;
    const client = getSupabaseClient(req.token);

    // 1. Fetch attempt details
    const { data: attempt, error: attemptError } = await client
      .from('csv_exam_attempts')
      .select('*')
      .eq('id', attempt_id)
      .single();

    if (attemptError) throw attemptError;

    // 2. Update status to submitted
    const { error: updateError } = await client
      .from('csv_exam_attempts')
      .update({ status: 'submitted' })
      .eq('id', attempt_id);

    if (updateError) throw updateError;

    // 3. Fetch test metadata
    const { data: mockExam } = await client
      .from('csv_mock_exams')
      .select('test_name')
      .eq('test_id', attempt.test_id)
      .maybeSingle();

    const testName = mockExam ? mockExam.test_name : 'Mock Exam';

    // 4. Fetch cadet info
    const { data: cadetProfile } = await client
      .from('cadet_profiles')
      .select('full_name')
      .eq('id', attempt.user_id)
      .single();

    const cadetName = cadetProfile ? cadetProfile.full_name : 'Cadet';

    // 5. Fetch cadet email
    const { data: cadetEmail } = await client
      .rpc('fn_get_user_email', { p_user_id: attempt.user_id });

    // 6. Notify cadet of result release
    const cadetNotif = {
      user_id: attempt.user_id,
      type: 'exam',
      title: `🔓 Result Released: ${testName}`,
      content: `Your exam results for "${testName}" have been released by your instructor. Final score: ${attempt.percentage}%`,
      link: '/dashboard',
      is_read: false
    };

    const { data: createdNotif } = await client
      .from('notifications')
      .insert(cadetNotif)
      .select()
      .single();

    if (createdNotif) {
      sendInAppAlert(attempt.user_id, createdNotif);
    }

    if (cadetEmail) {
      const cadetEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff;">
          <h2 style="color: #1a56db; text-align: center;">NCC Exam Result Released</h2>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p>Dear Cadet <strong>${cadetName}</strong>,</p>
          <p>Your flagged exam attempt for <strong>${testName}</strong> has been reviewed and released by your unit instructor.</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #bbf7d0; text-align: center;">
            <h3 style="margin: 0; color: #16a34a;">REVIEW APPROVED</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #111827;">${attempt.percentage}%</p>
            <p style="margin: 0; color: #4b5563;">Score: ${attempt.score} / ${attempt.total_questions} correct answers</p>
          </div>
          <p style="text-align: center;"><a href="http://localhost:5173/dashboard" style="background-color: #1a56db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Results</a></p>
        </div>
      `;
      sendEmailAlert({ to: cadetEmail, subject: `🔓 Result Released: ${testName}`, html: cadetEmailHtml }).catch(err => {
        console.error('[Exam Controller] Email send failed for cadet', cadetEmail, err);
      });
    }

    res.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error('[Exam Controller] Error releasing result:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

module.exports = {
  getAttempts,
  submitExam,
  releaseResult
};
