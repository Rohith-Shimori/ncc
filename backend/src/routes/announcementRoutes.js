const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAnnouncements);
router.post('/', verifyToken, createAnnouncement);
router.delete('/:id', verifyToken, deleteAnnouncement);

module.exports = router;
