const express = require('express');
const router = express.Router();
const { getAttempts, submitExam, releaseResult } = require('../controllers/examController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/attempts', verifyToken, getAttempts);
router.post('/submit', verifyToken, submitExam);
router.post('/release', verifyToken, releaseResult);

module.exports = router;
