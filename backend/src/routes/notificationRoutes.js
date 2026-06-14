const express = require('express');
const router = express.Router();
const { getNotifications, markRead, getVapidPublicKey, subscribePush } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications);
router.post('/read', verifyToken, markRead);
router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', verifyToken, subscribePush);

module.exports = router;
