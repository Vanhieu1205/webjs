const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    checkStudentEnrollment
} = require('../controllers/studentController');
const { auth, adminAuth } = require('../middleware/auth');

// @desc    Định nghĩa các route cho đường dẫn gốc /api/students
// @route   GET /api/students
// @access  Public/Private
router.route('/')
    .get(auth, getStudents)
    .post(auth, createStudent);

// @desc    Định nghĩa route để lấy sinh viên theo ID lớp học
// @route   GET /api/students/class/:classId
// @access  Private
router.route('/class/:classId').get(auth, getStudentsByClass);

// @desc    Định nghĩa route để kiểm tra đăng ký khóa học của sinh viên
// @route   GET /api/students/:id/courses
// @access  Private
router.route('/:id/courses').get(auth, checkStudentEnrollment);

// @desc    Định nghĩa các route cho đường dẫn /api/students/:id
// @route   GET/PUT/DELETE /api/students/:id
// @access  Private/Admin
router.route('/:id')
    .get(auth, getStudent)
    .put(auth, adminAuth, updateStudent)
    .delete(auth, adminAuth, deleteStudent);

module.exports = router; 