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

const { vapidKeys } = require('../config/webpush');

const getVapidPublicKey = async (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
};

const subscribePush = async (req, res) => {
  try {
    const { subscription } = req.body;
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);

    // Check if this subscription is already registered
    const { data: existing } = await client
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user_id)
      .eq('subscription->>endpoint', subscription.endpoint)
      .maybeSingle();

    if (existing) {
      return res.json({ success: true, message: 'Subscription already registered.' });
    }

    // Register new subscription
    const { error } = await client
      .from('push_subscriptions')
      .insert({
        user_id,
        subscription
      });

    if (error) throw error;
    res.json({ success: true, message: 'Subscription registered successfully.' });
  } catch (error) {
    console.error('[Notification Controller] Error saving push subscription:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

const markAllRead = async (req, res) => {
  try {
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);
    const { data, error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user_id)
      .eq('is_read', false);

    if (error) throw error;
    res.json({ data, error: null });
  } catch (error) {
    console.error('[Notification Controller] Error marking all read:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);
    const { data, error } = await client
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;
    res.json({ data, error: null });
  } catch (error) {
    console.error('[Notification Controller] Error deleting notification:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const client = getSupabaseClient(req.token);
    const { data, error } = await client
      .from('notifications')
      .delete()
      .eq('user_id', user_id);

    if (error) throw error;
    res.json({ data, error: null });
  } catch (error) {
    console.error('[Notification Controller] Error clearing notifications:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
};

module.exports = {
  getNotifications,
  markRead,
  getVapidPublicKey,
  subscribePush,
  markAllRead,
  deleteNotification,
  clearAllNotifications
};
