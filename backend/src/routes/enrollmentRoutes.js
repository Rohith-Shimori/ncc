const express = require('express');
const router = express.Router();
const { getEnrollments, enrollCourse } = require('../controllers/enrollmentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getEnrollments);
router.post('/enroll', verifyToken, enrollCourse);

module.exports = router;
