const { supabase, getSupabaseClient } = require('../config/supabase');
const { sendInAppAlert } = require('../config/socket');
const { sendEmailAlert } = require('../config/email');

const getAnnouncements = async (req, res) => {
  try {
    const client = getSupabaseClient(req.token);
    const { data, error } = await client
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data, error: null });
  } catch (error) {
    console.error('[Announcement Controller] Error fetching announcements:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body[0] : req.body;
    const { title, content, priority, target_wing } = payload || {};
    const created_by = req.user.id;
    const client = getSupabaseClient(req.token);

    // 1. Insert announcement using user client for RLS checks
    const { data: announcement, error: insertError } = await client
      .from('announcements')
      .insert({
        title,
        content,
        priority: priority || 'normal',
        target_wing: target_wing || 'Common',
        created_by,
        is_active: true
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Query target cadets using our helper RPC
    const { data: cadets, error: queryError } = await client
      .rpc('fn_get_users_by_wing', { p_wing: target_wing || 'Common' });

    if (queryError) {
      console.error('[Announcement Controller] Error fetching cadets for notifications:', queryError);
    } else if (cadets && cadets.length > 0) {
      for (const cadet of cadets) {
        if (cadet.id === created_by) continue;

        const notifData = {
          user_id: cadet.id,
          type: 'announcement',
          title: `📢 New Announcement: ${title}`,
          content: content,
          link: '/dashboard',
          is_read: false
        };

        const { data: notif, error: notifError } = await client
          .from('notifications')
          .insert(notifData)
          .select()
          .single();

        if (!notifError && notif) {
          sendInAppAlert(cadet.id, notif);
        }

        if (cadet.email) {
          const emailSubject = `NCC Announcement: ${title}`;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #fcfcfc;">
              <h2 style="color: #1a56db; text-align: center;">NCC Digital Training Portal</h2>
              <hr style="border: 0; border-top: 1px solid #eee;">
              <p>Dear Cadet <strong>${cadet.full_name || 'NCC Cadet'}</strong>,</p>
              <p>A new announcement has been published for your wing (<strong>${target_wing || 'Common'}</strong>):</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #1a56db; margin: 15px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #111827;">${title}</h3>
                <p style="white-space: pre-line; color: #374151; margin-bottom: 0;">${content}</p>
              </div>
              <p style="font-size: 13px; color: #6b7280;">Priority: <span style="text-transform: uppercase; font-weight: bold; color: ${priority === 'high' ? '#ef4444' : '#3b82f6'};">${priority || 'normal'}</span></p>
              <hr style="border: 0; border-top: 1px solid #eee;">
              <p style="text-align: center;"><a href="http://localhost:5173/dashboard" style="background-color: #1a56db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard</a></p>
              <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 30px;">This is an automated notification. Please do not reply to this email.</p>
            </div>
          `;
          sendEmailAlert({ to: cadet.email, subject: emailSubject, html: emailHtml }).catch(err => {
            console.error('[Announcement Controller] Error sending announcement email to', cadet.email, err);
          });
        }
      }
    }

    res.status(201).json({ data: announcement, error: null });
  } catch (error) {
    console.error('[Announcement Controller] Error creating announcement:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const client = getSupabaseClient(req.token);
    const { error } = await client
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ data: { success: true }, error: null });
  } catch (error) {
    console.error('[Announcement Controller] Error deleting announcement:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
