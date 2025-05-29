// Import thư viện Mongoose
const mongoose = require('mongoose');

// Định nghĩa Schema cho Model SinhVien
const studentSchema = new mongoose.Schema({
    _id: {
        type: String, // Kiểu dữ liệu String cho _id (Mã Sinh Viên)
        required: true, // Trường bắt buộc
        unique: true // Giá trị phải là duy nhất
    },
    HoTen: {
        type: String, // Kiểu dữ liệu String cho Họ tên
        required: [true, 'Vui lòng nhập họ tên'], // Trường bắt buộc với thông báo lỗi tùy chỉnh
        trim: true, // Xóa khoảng trắng ở đầu và cuối chuỗi
        maxlength: [50, 'Họ tên không được quá 50 ký tự'] // Giới hạn độ dài tối đa
    },
    LopSinhHoat: {
        type: String, // Kiểu dữ liệu String cho Lớp sinh hoạt
        required: [true, 'Vui lòng nhập lớp sinh hoạt'] // Trường bắt buộc
    },
    Email: {
        type: String, // Kiểu dữ liệu String cho Email
        required: [true, 'Vui lòng nhập email'], // Trường bắt buộc
        unique: true, // Giá trị phải là duy nhất
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Vui lòng nhập email hợp lệ' // Kiểm tra định dạng email bằng regex với thông báo lỗi tùy chỉnh
        ]
    },
    SoDienThoai: {
        type: String, // Kiểu dữ liệu String cho Số điện thoại
        required: [true, 'Vui lòng nhập số điện thoại'], // Trường bắt buộc
        maxlength: [20, 'Số điện thoại không được quá 20 ký tự'] // Giới hạn độ dài tối đa
    },
    NgayThamGia: {
        type: Date, // Kiểu dữ liệu Date cho Ngày tham gia
        default: Date.now // Giá trị mặc định là ngày hiện tại khi tạo mới
    }
});

// Export Model SinhVien
module.exports = mongoose.model('Student', studentSchema); 