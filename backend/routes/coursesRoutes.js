const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { upload } = require('../middlewares/uploadMiddleware');
const { createCourse } = require('../controllers/coursesController');

router.post('/', auth, adminAuth, upload.single('image'), createCourse);

module.exports = router; 