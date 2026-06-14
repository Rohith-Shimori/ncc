const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { initSocket } = require('./src/config/socket');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NCC Backend is running' });
});

// Import routes
const announcementRoutes = require('./src/routes/announcementRoutes');
const examRoutes = require('./src/routes/examRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

app.use('/api/announcements', announcementRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
