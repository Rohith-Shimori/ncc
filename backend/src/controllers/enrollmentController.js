const { supabase, getSupabaseClient } = require('../config/supabase');
const { sendInAppAlert } = require('../config/socket');
const { sendEmailAlert } = require('../config/email');

const getEnrollments = async (req, res) => {
  try {
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);
    const { data, error } = await client
      .from('course_enrollments')
      .select('course_id, courses(id, title, description, target_wing, certificate_level)')
      .eq('user_id', user_id);

    if (error) throw error;
    res.json({ data, error: null });
  } catch (error) {
    console.error('[Enrollment Controller] Error fetching enrollments:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);

    // 1. Insert enrollment into live database
    const { data: enrollment, error: enrollError } = await client
      .from('course_enrollments')
      .insert({
        user_id,
        course_id,
        status: 'enrolled',
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (enrollError) throw enrollError;

    // 2. Fetch course details
    const { data: course } = await client
      .from('courses')
      .select('title')
      .eq('id', course_id)
      .single();

    const courseTitle = course ? course.title : 'NCC Course';

    // 3. Fetch cadet details
    const { data: cadetProfile } = await client
      .from('cadet_profiles')
      .select('full_name, wing')
      .eq('id', user_id)
      .single();

    const cadetName = cadetProfile ? cadetProfile.full_name : 'Cadet';
    const cadetWing = cadetProfile ? cadetProfile.wing : 'Common';

    // 4. Fetch cadet email
    const { data: cadetEmail } = await client
      .rpc('fn_get_user_email', { p_user_id: user_id });

    // 5. Create notifications & dispatch Socket / Email
    const cadetNotif = {
      user_id: user_id,
      type: 'course',
      title: `📚 Enrolled in Course: ${courseTitle}`,
      content: `You have successfully enrolled in "${courseTitle}". Start studying now!`,
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff;">
          <h2 style="color: #1a56db; text-align: center;">NCC Course Enrollment</h2>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p>Dear Cadet <strong>${cadetName}</strong>,</p>
          <p>You have successfully enrolled in the training course: <strong>${courseTitle}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; color: #374151;">Course Details:</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">Title: ${courseTitle}</p>
            <p style="margin: 5px 0 0 0; color: #4b5563;">Status: Active / Enrolled</p>
          </div>
          <p>Log in to the NCC Digital Training Portal to view chapter modules, slideshows, and take mock practice tests.</p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p style="text-align: center;"><a href="http://localhost:5173/dashboard" style="background-color: #1a56db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Learning</a></p>
        </div>
      `;
      sendEmailAlert({ to: cadetEmail, subject: `📚 Enrolled: ${courseTitle}`, html: cadetEmailHtml }).catch(err => {
        console.error('[Enrollment Controller] Cadet email failed', cadetEmail, err);
      });
    }

    const { data: instructors } = await client.rpc('fn_get_all_instructors');
    if (instructors && instructors.length > 0) {
      for (const inst of instructors) {
        const instNotif = {
          user_id: inst.id,
          type: 'course',
          title: `👤 Cadet Enrolled: ${cadetName}`,
          content: `${cadetName} enrolled in "${courseTitle}" (${cadetWing} wing).`,
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

        if (inst.email) {
          const instEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff;">
              <h2 style="color: #1a56db; text-align: center;">NCC Enrollment Update</h2>
              <hr style="border: 0; border-top: 1px solid #eee;">
              <p>Hello Instructor <strong>${inst.full_name}</strong>,</p>
              <p>A cadet has enrolled in a new training course:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <tr style="background-color: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Cadet Name:</td><td style="padding: 8px;">${cadetName}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Cadet Wing:</td><td style="padding: 8px;">${cadetWing}</td></tr>
                <tr style="background-color: #f9fafb;"><td style="padding: 8px; font-weight: bold;">Course Name:</td><td style="padding: 8px;">${courseTitle}</td></tr>
              </table>
            </div>
          `;
          sendEmailAlert({ to: inst.email, subject: `👤 Course Enrollment: ${cadetName}`, html: instEmailHtml }).catch(err => {
            console.error('[Enrollment Controller] Instructor email failed', inst.email, err);
          });
        }
      }
    }

    res.status(201).json({ data: enrollment, error: null });
  } catch (error) {
    console.error('[Enrollment Controller] Error enrolling in course:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

module.exports = {
  getEnrollments,
  enrollCourse
};
