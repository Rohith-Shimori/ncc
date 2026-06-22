const { supabase, getSupabaseClient } = require('../config/supabase');
const { sendInAppAlert } = require('../config/socket');
const { sendEmailAlert } = require('../config/email');
const { buildAnnouncementEmail } = require('../utils/emailTemplates');

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
          const emailHtml = buildAnnouncementEmail(cadet.full_name, target_wing, title, content, priority);
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
