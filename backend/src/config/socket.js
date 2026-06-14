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

const sendInAppAlert = (room, notification) => {
  if (io) {
    io.to(room).emit('new_notification', notification);
    console.log(`[Socket.io] Dispatched in-app notification to room: ${room}`);
  } else {
    console.warn('[Socket.io] Cannot send alert, socket.io is not initialized.');
  }
};

module.exports = {
  initSocket,
  getIo,
  sendInAppAlert
};
