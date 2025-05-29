// Import thư viện Mongoose
const mongoose = require('mongoose');

// Định nghĩa Schema cho Model Khóa học
const CourseSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId, // Kiểu dữ liệu ObjectId cho _id (ID Khóa học, tự động tạo)
        auto: true
    },
    TenKhoaHoc: {
        type: String, // Tên khóa học
        required: [true, 'Vui lòng nhập tên khóa học'], // Bắt buộc
        unique: true, // Duy nhất
        trim: true, // Xóa khoảng trắng thừa
        maxlength: [50, 'Tên khóa học không được quá 50 ký tự'] // Giới hạn độ dài
    },
    MoTa: {
        type: String, // Mô tả khóa học
        required: [true, 'Vui lòng nhập mô tả'], // Bắt buộc
        maxlength: [500, 'Mô tả không được quá 500 ký tự'] // Giới hạn độ dài
    },
    NgayBatDau: {
        type: Date, // Ngày bắt đầu khóa học
        required: [true, 'Vui lòng nhập ngày bắt đầu'] // Bắt buộc
    },
    NgayKetThuc: {
        type: Date, // Ngày kết thúc khóa học
        required: [true, 'Vui lòng nhập ngày kết thúc'] // Bắt buộc
    },
    image: {
        type: String, // Đường dẫn/tên file hình ảnh
        required: [true, 'Vui lòng thêm hình ảnh'] // Bắt buộc
    },
    students: [ // Mảng chứa ID của các sinh viên đăng ký khóa học này
        {
            type: String, // Kiểu dữ liệu String cho ID sinh viên (LƯU Ý: Bạn đang lưu String, không phải ObjectId)
            ref: 'Student' // Tham chiếu đến Model Student (sử dụng cho populate nếu cần, nhưng type là String nên cẩn thận)
        }],
    supports: [ // Mảng chứa ID của các support cho khóa học này
        {
            type: String, // Kiểu dữ liệu String cho ID support
            ref: 'Support' // Tham chiếu đến Model Support
        }]
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Export Model Course
module.exports = mongoose.model('Course', CourseSchema); 