const express = require('express');
const router = express.Router();
const { getNotifications, markRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications);
router.post('/read', verifyToken, markRead);

module.exports = router;
