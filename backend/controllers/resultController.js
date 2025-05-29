const Result = require('../models/Result');
const Student = require('../models/Student');
const Course = require('../models/Course');
const mongoose = require('mongoose'); // Import mongoose to check for valid ObjectId

// Helper function to find student by string ID if not ObjectId
async function findStudentId(studentIdentifier) {
    // Check if the identifier is already a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(studentIdentifier)) {
        return studentIdentifier; // It's already an ObjectId, use it directly
    }

    // If not a valid ObjectId, try to find a student by their original string _id
    // This assumes that the original string IDs (like "SV001") are stored in the _id field
    // If you used a different field for these codes, you need to adjust this query.
    const student = await Student.findOne({ _id: studentIdentifier });
    return student ? student._id : null; // Return the found student's actual _id (an ObjectId)
}

// @desc    Get result for a student in a course
// @route   GET /api/results/:courseId/:studentId
// @access  Public
const getResult = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const studentIdentifier = req.params.studentId;

        // Validate courseId format
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, message: 'Invalid Course ID format.' });
        }

        // Find the correct student ObjectId using the helper function
        const studentId = await findStudentId(studentIdentifier);
        if (!studentId) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        const result = await Result.findOne({
            course: courseId,
            student: studentId // Use the found ObjectId
        });

        if (!result) {
            // If no result found, return a default structure indicating no score yet
            return res.status(200).json({
                success: true,
                data: { score: null, student: req.params.studentId, course: req.params.courseId }
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        // Add specific error handling for CastError
        if (error.name === 'CastError') {
            // This should ideally not happen if findStudentId works correctly,
            // but keep it for robustness against unexpected scenarios.
            return res.status(400).json({ success: false, message: 'Invalid ID format during database query.' });
        }
        console.error('Error in getResult:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add or update result for a student in a course
// @route   POST /api/results
// @access  Public
const addOrUpdateResult = async (req, res) => {
    const { courseId, studentId: studentIdentifier, score } = req.body; // Rename studentId from body to studentIdentifier

    // Basic validation
    if (!courseId || !studentIdentifier || score === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields: courseId, studentId, score' });
    }

    try {
        // Find the correct student ObjectId using the helper function
        const studentId = await findStudentId(studentIdentifier);
        if (!studentId) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        let result = await Result.findOne({ course: courseId, student: studentId }); // Use the found ObjectId

        if (result) {
            // Update existing result
            result.score = score;
            await result.save();
            res.status(200).json({ success: true, data: result, message: 'Kết quả đã được cập nhật' });
        } else {
            // Create new result
            result = await Result.create({
                course: courseId,
                student: studentId, // Use the found ObjectId
                score: score
            });
            res.status(201).json({ success: true, data: result, message: 'Kết quả đã được thêm' });
        }
    } catch (error) {
        // Handle Mongoose validation errors (e.g., score min/max)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        // Add specific error handling for CastError
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid ID format during database operation.' });
        }
        console.error('Error in addOrUpdateResult:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all results with student and course details populated
// @route   GET /api/results
// @access  Public
const getAllResults = async (req, res) => {
    try {
        const result = await Result.find()
            .populate('student', 'HoTen') // Populate student name
            .populate('course', 'TenKhoaHoc'); // Populate course name

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getResult,
    addOrUpdateResult,
    getAllResults
}; 