// Logging to confirm file is loaded
console.log('backend/routes/resultsRoutes.js loaded');

const express = require('express');
const router = express.Router();
const {
    getResult,
    addOrUpdateResult,
    getAllResults
} = require('../controllers/resultController');

// @desc    Get all results
// @route   GET /api/results
// @access  Public
router.get('/', getAllResults);

// @desc    Get result for a student in a course
// @route   GET /api/results/:courseId/:studentId
// @access  Public
router.get('/:courseId/:studentId', getResult);

// @desc    Add or update result for a student in a course
// @route   POST /api/results
// @access  Public
router.post('/', addOrUpdateResult);

module.exports = router; 