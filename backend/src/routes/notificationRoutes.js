const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markRead, 
  getVapidPublicKey, 
  subscribePush,
  markAllRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications);
router.post('/read', verifyToken, markRead);
router.post('/read-all', verifyToken, markAllRead);
router.delete('/', verifyToken, clearAllNotifications);
router.delete('/:id', verifyToken, deleteNotification);
router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', verifyToken, subscribePush);

module.exports = router;
