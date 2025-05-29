const mongoose = require('mongoose');

const ResultSchema = mongoose.Schema({
    student: {
        type: String,
        ref: 'Student',
    },
    course: {
        type: String,
        ref: 'Course',
    },
    score: {
        type: Number,
        required: true,
        min: 0, // Assuming score is non-negative
        max: 10 // Assuming score is out of 10, adjust as needed
    },
    // You can add more fields like date recorded, evaluator, etc.
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Result', ResultSchema); 