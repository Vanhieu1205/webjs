const Course = require('../models/Course');
const Student = require('../models/Student');
const Support = require('../models/Support');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Public
exports.createCourse = async (req, res) => {
    try {
        const course = new Course({
            TenKhoaHoc: req.body.TenKhoaHoc,
            MoTa: req.body.MoTa,
            NgayBatDau: req.body.NgayBatDau,
            NgayKetThuc: req.body.NgayKetThuc,
            image: req.file ? req.file.filename : req.body.image,
            students: [],
            supports: []
        });

        const newCourse = await course.save();
        res.status(201).json({
            success: true,
            data: newCourse
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Public
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                TenKhoaHoc: req.body.TenKhoaHoc,
                MoTa: req.body.MoTa,
                NgayBatDau: req.body.NgayBatDau,
                NgayKetThuc: req.body.NgayKetThuc,
                image: req.file ? req.file.filename : req.body.image
            },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Public
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        res.json({
            success: true,
            message: 'Course deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get course details with students and supports
// @route   GET /api/courses/:id/details
// @access  Public
exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Get students and supports details
        const students = await Student.find({ _id: { $in: course.students } });
        const supports = await Support.find({ _id: { $in: course.supports } });

        res.json({
            success: true,
            data: {
                course,
                students,
                supports
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add student to course
// @route   POST /api/courses/:id/students
// @access  Public
exports.addStudentToCourse = async (req, res) => {
    console.log('addStudentToCourse controller: req.user =', req.user);
    try {
        const { studentId } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (!course.students.includes(studentId)) {
            course.students.push(studentId);
            await course.save();
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Lỗi khi thêm học viên vào khóa học.'
        });
    }
};

// @desc    Add support to course
// @route   POST /api/courses/:id/supports
// @access  Public
exports.addSupportToCourse = async (req, res) => {
    console.log('Attempting to add support', req.body.supportId, 'to course', req.params.id);
    try {
        const { supportId } = req.body;
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (!course.supports.includes(supportId)) {
            course.supports.push(supportId);
            await course.save();
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Lỗi khi thêm support vào khóa học.'
        });
    }
};

// @desc    Remove student from course
// @route   DELETE /api/courses/:id/students/:studentId
// @access  Public
exports.removeStudentFromCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        course.students = course.students.filter(id => id !== req.params.studentId);
        await course.save();

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove support from course
// @route   DELETE /api/courses/:id/supports/:supportId
// @access  Public
exports.removeSupportFromCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        course.supports = course.supports.filter(id => id !== req.params.supportId);
        await course.save();

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}; 