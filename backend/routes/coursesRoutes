const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseDetails,
    addStudentToCourse,
    addSupportToCourse,
    removeStudentFromCourse,
    removeSupportFromCourse
} = require('../controllers/courseController');
const { auth, adminAuth } = require('../middleware/auth');

// Tạo thư mục nếu chưa tồn tại
const imageDir = path.join(__dirname, '../../frontend/images');
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Khởi tạo multer cho courses
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageDir);
    },
    filename: (req, file, cb) => {
        // Lấy phần mở rộng của ảnh
        const ext = path.extname(file.originalname);
        const courseName = req.body.TenKhoaHoc || 'unknown';
        cb(null, `${courseName}${ext}`);
    }
});

const upload = multer({ storage });

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
router.get('/', auth, getCourses);

// @desc    Create new course
// @route   POST /api/courses
// @access  Admin
router.post('/', auth, adminAuth, upload.single('image'), createCourse);

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
router.get('/:id', auth, getCourse);

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin
router.put('/:id', auth, adminAuth, upload.single('image'), updateCourse);

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
router.delete('/:id', auth, adminAuth, deleteCourse);

// @desc    Get course details with students and supports
// @route   GET /api/courses/:id/details
// @access  Private
router.get('/:id/details', auth, getCourseDetails);

// @desc    Add student to course
// @route   POST /api/courses/:id/students
// @access  Admin
router.post('/:id/students', auth, addStudentToCourse);

// @desc    Add support to course
// @route   POST /api/courses/:id/supports
// @access  Admin
router.post('/:id/supports', auth, adminAuth, addSupportToCourse);

// @desc    Remove student from course
// @route   DELETE /api/courses/:id/students/:studentId
// @access  Admin
router.delete('/:id/students/:studentId', auth, adminAuth, removeStudentFromCourse);

// @desc    Remove support from course
// @route   DELETE /api/courses/:id/supports/:supportId
// @access  Admin
router.delete('/:id/supports/:supportId', auth, adminAuth, removeSupportFromCourse);

module.exports = router; 