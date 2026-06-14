const { getSupabaseClient } = require('../config/supabase');

const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data, error: null });
  } catch (error) {
    console.error('[Notification Controller] Error fetching notifications:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.body;
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);

    const { data, error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data, error: null });
  } catch (error) {
    console.error('[Notification Controller] Error marking notification read:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

module.exports = {
  getNotifications,
  markRead
};
