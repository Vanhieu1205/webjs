const Student = require('../models/Student');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// @desc    Lấy tất cả sinh viên
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res) => {
    try {
        // Tìm tất cả sinh viên trong cơ sở dữ liệu
        const students = await Student.find();
        // Trả về danh sách sinh viên thành công
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        // Xử lý lỗi nếu không lấy được danh sách sinh viên
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy thông tin một sinh viên theo ID
// @route   GET /api/students/:id
// @access  Public
const getStudent = async (req, res) => {
    try {
        // Tìm sinh viên theo ID được gửi trong request params
        const student = await Student.findById(req.params.id);
        // Kiểm tra nếu không tìm thấy sinh viên
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sinh viên'
            });
        }
        // Trả về thông tin sinh viên thành công
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        // Xử lý lỗi nếu không lấy được thông tin sinh viên
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Tạo mới một sinh viên
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res) => {
    console.log('createStudent controller: req.user =', req.user);
    // Ánh xạ dữ liệu từ body request vào định dạng PascalCase cho Mongoose (giống frontend gửi lên)
    const studentData = {
        _id: req.body._id,
        HoTen: req.body.HoTen, // Tên sinh viên
        LopSinhHoat: req.body.LopSinhHoat, // Lớp sinh hoạt
        Email: req.body.Email, // Email
        SoDienThoai: req.body.SoDienThoai, // Số điện thoại
        NgayThamGia: req.body.NgayThamGia || Date.now() // Ngày tham gia (mặc định là ngày hiện tại nếu không có)
        // Thêm các trường khác nếu cần, sử dụng PascalCase từ frontend
    };

    // Tạo một instance Student mới từ dữ liệu
    const student = new Student(studentData);
    try {
        // Lưu sinh viên mới vào cơ sở dữ liệu
        const newStudent = await student.save();
        // Trả về sinh viên vừa tạo thành công
        res.status(201).json({
            success: true,
            data: newStudent
        });
    } catch (error) {
        // Xử lý lỗi nếu không tạo được sinh viên
        console.error('Error creating student:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Lỗi khi tạo mới sinh viên.',
            details: error.errors // Chi tiết lỗi validation nếu có
        });
    }
};

// @desc    Cập nhật thông tin một sinh viên theo ID
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res) => {
    // Ánh xạ dữ liệu cập nhật từ body request vào định dạng PascalCase cho Mongoose
    const studentData = {
        HoTen: req.body.HoTen,
        LopSinhHoat: req.body.LopSinhHoat,
        Email: req.body.Email,
        SoDienThoai: req.body.SoDienThoai,
        // Thêm các trường khác nếu cần, không cập nhật _id tại đây
    };
    try {
        // Tìm và cập nhật sinh viên theo ID
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            studentData, // Dữ liệu đã ánh xạ
            { new: true, runValidators: true } // Tùy chọn: trả về bản ghi mới, chạy lại validation
        );
        // Kiểm tra nếu không tìm thấy sinh viên để cập nhật
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sinh viên để cập nhật'
            });
        }
        // Trả về sinh viên đã cập nhật thành công
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        // Xử lý lỗi nếu không cập nhật được sinh viên
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Xóa một sinh viên theo ID
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res) => {
    try {
        // Tìm và xóa sinh viên theo ID
        const student = await Student.findByIdAndDelete(req.params.id);
        // Kiểm tra nếu không tìm thấy sinh viên để xóa
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sinh viên để xóa'
            });
        }
        // Trả về thông báo xóa thành công
        res.json({
            success: true,
            message: 'Đã xóa sinh viên'
        });
    } catch (error) {
        // Xử lý lỗi nếu không xóa được sinh viên
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Lấy danh sách sinh viên theo ID lớp học
// @route   GET /api/students/class/:classId
// @access  Public
const getStudentsByClass = async (req, res) => {
    // Phản hồi tạm thời cho route theo lớp học (chức năng chưa được triển khai đầy đủ)
    res.status(501).json({ success: false, message: 'Chức năng lấy sinh viên theo lớp chưa được triển khai.' });
};

// @desc    Kiểm tra xem một sinh viên có đang tham gia khóa học nào không và trả về thông tin khóa học
// @route   GET /api/students/:id/courses
// @access  Public
const checkStudentEnrollment = async (req, res) => {
    try {
        const studentId = req.params.id; // Lấy ID sinh viên từ request params

        // --- Đã bỏ kiểm tra mongoose.Types.ObjectId.isValid(studentId) ---
        // Việc này cho phép các chuỗi không phải ObjectId được truyền vào truy vấn.
        // Đảm bảo truy vấn cơ sở dữ liệu và kiểu dữ liệu của bạn có thể xử lý các ID hiện có.
        // ---------------------------------------------------------------------

        // Tìm TẤT CẢ các khóa học mà trong mảng 'students' (kiểu String) của chúng có chứa studentId này
        const courses = await Course.find({ students: studentId });

        // Kiểm tra xem mảng khóa học tìm được có rỗng không
        const isEnrolled = courses && courses.length > 0; // isEnrolled là true nếu tìm thấy ít nhất 1 khóa học

        // Phản hồi về cho frontend
        if (isEnrolled) {
            // Nếu sinh viên có trong khóa học, trả về success, isEnrolled: true, thông báo và MẢNG các khóa học
            res.json({ success: true, isEnrolled: true, message: 'Sinh viên đang trong các khóa học sau.', courses: courses });
        } else {
            // Nếu sinh viên không có trong khóa học nào, trả về success, isEnrolled: false và thông báo
            res.json({ success: true, isEnrolled: false, message: 'Sinh viên không có trong khóa học nào.' });
        }

    } catch (error) {
        // Xử lý lỗi nếu có vấn đề khi kiểm tra trạng thái khóa học
        console.error('Error checking student enrollment:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi kiểm tra trạng thái khóa học của sinh viên.', error: error.message });
    }
};

// Xuất (export) các hàm controller để sử dụng ở nơi khác (ví dụ: routes)
module.exports = {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    checkStudentEnrollment
}; 