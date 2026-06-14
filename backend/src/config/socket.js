const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`[Socket.io] User ${userId} joined personal room.`);
      }
    });

    socket.on('join_role', (role) => {
      if (role) {
        socket.join(role);
        console.log(`[Socket.io] Client joined role room: ${role}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('[Socket.io] Socket.io not initialized!');
  }
  return io;
};

const sendPushNotification = async (userId, notification) => {
  try {
    const { supabase } = require('./supabase');
    const { webpush } = require('./webpush');

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    if (error) throw error;
    if (!subs || subs.length === 0) return;

    const payload = JSON.stringify({
      title: notification.title || 'NCC Digital Training',
      content: notification.content || '',
      link: notification.link || '/dashboard'
    });

    console.log(`[WebPush] Dispatched background Web Push to ${subs.length} subscriptions for user ${userId}`);

    const pushPromises = subs.map(sub => 
      webpush.sendNotification(sub.subscription, payload)
        .catch(err => {
          console.warn(`[WebPush] Delivery failed to ${sub.subscription.endpoint.slice(0, 40)}... Status: ${err.statusCode}`);
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Delete expired subscription
            supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', userId)
              .eq('subscription->>endpoint', sub.subscription.endpoint)
              .then(() => console.log('[WebPush] Cleaned up expired/uninstalled subscription.'))
              .catch(dErr => console.error('[WebPush] Clean up failed:', dErr));
          }
        })
    );

    await Promise.all(pushPromises);
  } catch (err) {
    console.error('[WebPush] Notification dispatch error:', err);
  }
};

const sendInAppAlert = (room, notification) => {
  if (io) {
    io.to(room).emit('new_notification', notification);
    console.log(`[Socket.io] Dispatched in-app notification to room: ${room}`);

    // If room is a user ID, send background Web Push notification
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(room);
    if (isUuid) {
      sendPushNotification(room, notification);
    }
  } else {
    console.warn('[Socket.io] Cannot send alert, socket.io is not initialized.');
  }
};

module.exports = {
  initSocket,
  getIo,
  sendInAppAlert
};
