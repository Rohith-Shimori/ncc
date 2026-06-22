const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const Sentry = require("@sentry/node");

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
  console.log('[Sentry Config] Live Sentry DSN found. Backend error tracking active.');
}

const express = require('express');
const cors = require('cors');
const http = require('http');
const { initSocket } = require('./src/config/socket');

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
const publicRoutes = require('./src/routes/publicRoutes');

app.use('/api/announcements', announcementRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);

// Sentry error handler (must be placed before any other error middleware and after all controllers)
if (process.env.SENTRY_DSN) {
  if (typeof Sentry.setupExpressErrorHandler === 'function') {
    Sentry.setupExpressErrorHandler(app);
  } else if (Sentry.Handlers && typeof Sentry.Handlers.errorHandler === 'function') {
    app.use(Sentry.Handlers.errorHandler());
  }
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
