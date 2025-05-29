import { getAuthHeaders, handleApiResponse } from './utils.js';

// Đợi DOM (cấu trúc HTML) được tải hoàn toàn trước khi chạy mã JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM cần thiết bằng ID
    const loadingElement = document.getElementById('loading'); // Spinner hoặc indicator tải dữ liệu
    const errorElement = document.getElementById('error'); // Phần tử hiển thị thông báo lỗi/thành công
    const studentsContainer = document.getElementById('students-grid'); // Container chứa danh sách thẻ sinh viên
    const modal = document.getElementById('add-student-modal'); // Modal thêm/sửa sinh viên
    const modalTitle = document.querySelector('#add-student-modal h2'); // Tiêu đề modal
    const studentForm = document.getElementById('add-student-form'); // Form trong modal
    const addStudentBtn = document.querySelector('.page-header .add-button'); // Nút 'Thêm sinh viên'
    const closeModalBtn = document.querySelector('#add-student-modal .close-button'); // Nút đóng modal (x)
    const cancelModalBtn = document.querySelector('#add-student-modal .cancel-button'); // Nút Hủy trong modal
    const classFilter = document.getElementById('class-filter'); // Dropdown lọc theo lớp
    const statusFilter = document.getElementById('status-filter'); // Dropdown lọc theo trạng thái (nếu có)
    const searchInput = document.getElementById('search-input'); // Input tìm kiếm
    const studentClassSelect = document.getElementById('student-class'); // Dropdown chọn lớp trong form modal
    const studentIdInput = document.getElementById('student-id'); // Input ID sinh viên trong form modal
    const studentIdGroup = document.querySelector('.student-id-group'); // Group chứa input ID sinh viên (để ẩn/hiện khi thêm/sửa)

    // Ghi log (console.log) để kiểm tra xem các phần tử DOM đã được tìm thấy chưa (hữu ích cho debugging)
    console.log('loadingElement:', loadingElement);
    console.log('errorElement:', errorElement);
    console.log('studentsContainer:', studentsContainer);
    console.log('modal:', modal);
    console.log('modalTitle:', modalTitle);
    console.log('studentForm:', studentForm);
    console.log('addStudentBtn:', addStudentBtn);
    console.log('closeModalBtn:', closeModalBtn);
    console.log('cancelModalBtn:', cancelModalBtn);
    console.log('classFilter:', classFilter);
    console.log('statusFilter:', statusFilter);
    console.log('searchInput:', searchInput);
    console.log('studentClassSelect:', studentClassSelect);
    console.log('studentIdInput:', studentIdInput);
    console.log('studentIdGroup:', studentIdGroup);

    // Biến trạng thái toàn cục
    let currentStudentId = null; // Lưu ID của sinh viên đang được chỉnh sửa/xóa
    let allStudents = []; // Lưu trữ toàn bộ danh sách sinh viên lấy từ API



    // Hàm hiển thị danh sách sinh viên lên giao diện
    const displayStudents = (students) => {
        // Lấy lại container và template thẻ sinh viên (để đảm bảo không bị lỗi nếu các biến const ban đầu null)
        const studentsContainer = document.getElementById('students-grid');
        const cardTemplate = document.getElementById('student-card-template');
        // Xóa nội dung hiện tại của container
        studentsContainer.innerHTML = '';

        // Lấy thông tin user từ localStorage và kiểm tra role
        const user = JSON.parse(localStorage.getItem('user'));
        const isAdmin = user && user.role === 'admin';

        // Kiểm tra nếu không tìm thấy template
        if (!cardTemplate) {
            console.error('Student card template not found!');
            showError('Lỗi hiển thị: Không tìm thấy mẫu thẻ học viên.');
            return;
        }

        // Lặp qua từng sinh viên và tạo thẻ hiển thị
        students.forEach(student => {
            // Clone template để tạo thẻ mới
            const clone = document.importNode(cardTemplate.content, true);

            // Ghi log dữ liệu sinh viên và phần tử DOM tìm được (hữu ích cho debugging)
            console.log('Processing student:', student);
            const studentIdElement = clone.querySelector('[data-student-id]');
            console.log('Found student ID element:', studentIdElement);

            // Hiển thị Mã sinh viên (_id field)
            if (studentIdElement) {
                studentIdElement.textContent = student._id || '';
            } else {
                console.error('Student ID element not found for student:', student._id);
            }

            // Điền dữ liệu sinh viên vào các phần tử tương ứng trong thẻ (dựa trên cấu trúc JSON PascalCase từ backend)
            clone.querySelector('[data-student-name]').textContent = student.HoTen || 'N/A'; // Họ tên
            clone.querySelector('[data-student-email]').textContent = student.Email || 'N/A'; // Email
            clone.querySelector('[data-student-phone]').textContent = student.SoDienThoai || 'N/A'; // Số điện thoại
            clone.querySelector('[data-student-class]').textContent = student.LopSinhHoat || 'Không xác định'; // Lớp sinh hoạt
            // Định dạng và hiển thị Ngày tham gia
            clone.querySelector('[data-student-join-date]').textContent = student.NgayThamGia ? new Date(student.NgayThamGia).toLocaleDateString('vi-VN') : 'N/A';

            // Thiết lập sự kiện cho các nút (Đảm bảo các nút tồn tại trong template)
            const editButton = clone.querySelector('[data-edit-button]'); // Nút Sửa
            const deleteButton = clone.querySelector('[data-delete-button]'); // Nút Xóa

            // Chỉ hiển thị nút Sửa và Xóa cho Admin
            if (isAdmin) {
                if (editButton) {
                    // Gắn sự kiện click để mở modal sửa với ID sinh viên
                    editButton.onclick = () => window.editStudent(student._id);
                    editButton.style.display = 'inline-block'; // Hiển thị nút
                }

                if (deleteButton) {
                    // Gắn sự kiện click để gọi hàm xóa sinh viên với ID sinh viên
                    deleteButton.onclick = () => window.deleteStudent(student._id);
                    deleteButton.style.display = 'inline-block'; // Hiển thị nút
                }
            } else {
                // Ẩn nút Sửa và Xóa nếu không phải Admin
                if (editButton) editButton.style.display = 'none';
                if (deleteButton) deleteButton.style.display = 'none';
            }

            // Thêm thẻ sinh viên đã tạo vào container hiển thị
            studentsContainer.appendChild(clone);
        });
    };

    // Hàm lọc danh sách sinh viên dựa trên các bộ lọc (lớp, trạng thái, tìm kiếm)
    const filterStudents = () => {
        // Lấy lại các phần tử bộ lọc
        const classFilter = document.getElementById('class-filter');
        const statusFilter = document.getElementById('status-filter');
        const searchInput = document.getElementById('search-input');

        // Lấy giá trị từ các bộ lọc và chuyển sang chữ thường để so sánh không phân biệt chữ hoa/thường
        const classValue = classFilter ? classFilter.value.toLowerCase() : '';
        const statusValue = statusFilter ? statusFilter.value.toLowerCase() : ''; // Giữ logic lọc trạng thái nếu cần
        const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

        // Lọc danh sách sinh viên dựa trên các tiêu chí
        const filteredStudents = allStudents.filter(student => {
            // Lọc theo tên lớp sinh hoạt (sử dụng PascalCase từ dữ liệu)
            const matchesClass = !classValue || (student.LopSinhHoat && student.LopSinhHoat.toLowerCase().includes(classValue));
            // Lọc theo trạng thái (giả định TrangThai vẫn được sử dụng nếu có)
            const matchesStatus = !statusValue || (student.TrangThai && student.TrangThai.toLowerCase()) === statusValue;
            // Lọc theo các trường tìm kiếm (Họ tên, Email, SĐT, Lớp, ID)
            const matchesSearch = !searchValue ||
                (student.HoTen && student.HoTen.toLowerCase().includes(searchValue)) ||
                (student.Email && student.Email.toLowerCase().includes(searchValue)) ||
                (student.SoDienThoai && student.SoDienThoai.includes(searchValue)) ||
                (student.LopSinhHoat && student.LopSinhHoat.toLowerCase().includes(searchValue)) ||
                (student._id && student._id.toLowerCase().includes(searchValue));

            // Trả về true nếu sinh viên khớp với tất cả các bộ lọc đang áp dụng
            return matchesClass && matchesStatus && matchesSearch;
        });

        // Hiển thị danh sách sinh viên đã lọc
        displayStudents(filteredStudents);
    };

    // Hàm điền dữ liệu vào dropdown lọc lớp từ danh sách sinh viên
    const populateClassFilter = (students) => {
        const classFilter = document.getElementById('class-filter');

        // Thêm kiểm tra null cho phần tử bộ lọc
        if (!classFilter) {
            console.error('Class filter element with ID "class-filter" not found.');
            return;
        }

        // Lấy danh sách tên lớp duy nhất từ dữ liệu sinh viên (sử dụng PascalCase)
        const uniqueClasses = [...new Set(students.map(student => student.LopSinhHoat).filter(className => className))];

        // Tạo các tùy chọn (option) cho dropdown
        classFilter.innerHTML = `
            <option value="">Tất cả lớp học</option>
            ${uniqueClasses.map(className => `
                <option value="${className}">${className}</option>
            `).join('')}
        `;
    };

    // Gắn các Event Listener (Đã di chuyển xuống sau khi định nghĩa các hàm)
    const openAddStudentModal = () => openModal(); // Hàm mở modal thêm/sửa
    const closeAddStudentModal = () => closeModal(); // Hàm đóng modal

    // Thêm kiểm tra role cho nút Thêm sinh viên
    const user = JSON.parse(localStorage.getItem('user'));

    if (addStudentBtn && user) { // Kiểm tra user có tồn tại (đã đăng nhập) hay không
        addStudentBtn.addEventListener('click', openAddStudentModal);
        addStudentBtn.style.display = 'inline-block'; // Luôn hiển thị nếu user đã đăng nhập
    } else if (addStudentBtn) {
        addStudentBtn.style.display = 'none'; // Ẩn nếu chưa đăng nhập
    }

    // Thêm kiểm tra null trước khi gắn event listener
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddStudentModal); // Nút đóng modal (x)
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal); // Nút Hủy trong modal
    if (studentForm) studentForm.addEventListener('submit', handleFormSubmit); // Form submit

    // Các event listener cho bộ lọc và tìm kiếm (tham chiếu đến hàm filterStudents)
    const classFilterElement = document.getElementById('class-filter');
    const statusFilterElement = document.getElementById('status-filter');
    const searchInputElement = document.getElementById('search-input');

    if (classFilterElement) classFilterElement.addEventListener('change', filterStudents); // Khi giá trị dropdown lớp thay đổi
    if (statusFilterElement) statusFilterElement.addEventListener('change', filterStudents); // Khi giá trị dropdown trạng thái thay đổi
    if (searchInputElement) searchInputElement.addEventListener('input', filterStudents); // Khi nội dung input tìm kiếm thay đổi

    // Đóng modal khi click ra ngoài vùng nội dung modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Các hàm xử lý modal và API
    // Hàm mở modal (sử dụng cho cả thêm và sửa)
    async function openModal(studentData = null) {
        // Lưu ID sinh viên hiện tại nếu đang sửa
        currentStudentId = studentData ? studentData._id : null;
        // Cập nhật tiêu đề modal (Sửa hoặc Thêm mới)
        modalTitle.textContent = studentData ? 'Sửa học viên' : 'Thêm học viên mới';

        // Thay đổi text của nút submit trong form
        const submitButton = studentForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = studentData ? 'Cập nhật' : 'Lưu';
        }

        // Điền dữ liệu vào form nếu đang ở chế độ sửa (dựa trên dữ liệu sinh viên nhận được)
        if (studentData) {
            studentIdInput.value = studentData._id || ''; // Điền ID
            studentIdInput.readOnly = true; // Cho phép chỉnh sửa ID khi sửa
            studentIdGroup.style.display = 'block'; // Hiển thị group chứa input ID
            document.getElementById('student-name').value = studentData.HoTen || ''; // Điền Họ tên
            document.getElementById('student-email').value = studentData.Email || ''; // Điền Email
            document.getElementById('student-phone').value = studentData.SoDienThoai || ''; // Điền Số điện thoại
            document.getElementById('student-class').value = studentData.LopSinhHoat || ''; // Điền Lớp sinh hoạt
        } else {
            // Reset form và thiết lập lại khi thêm mới
            studentForm.reset(); // Xóa dữ liệu form
            studentIdInput.value = ''; // Xóa ID cũ
            studentIdInput.readOnly = false; // Cho phép nhập ID mới
            studentIdGroup.style.display = 'block'; // Hiển thị group chứa input ID
        }

        // Hiển thị modal
        modal.classList.add('active');
    }

    // Hàm đóng modal
    function closeModal() {
        // Ẩn modal
        modal.classList.remove('active');
        // Reset form
        studentForm.reset();
        // Đặt lại currentStudentId về null
        currentStudentId = null;
        // Thiết lập lại input ID
        if (studentIdInput) {
            studentIdInput.readOnly = false; // Cho phép nhập ID
            studentIdInput.value = ''; // Xóa giá trị ID
        }
        // Reset text nút submit về "Lưu"
        const submitButton = studentForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Lưu';
        }
    }

    // Hàm xử lý khi form được submit (thêm hoặc cập nhật sinh viên)
    async function handleFormSubmit(e) {
        e.preventDefault(); // Ngăn chặn hành vi submit mặc định của form

        const studentId = studentIdInput.value.trim(); // Lấy ID sinh viên từ input
        // Chuẩn bị dữ liệu form để gửi đi (sử dụng PascalCase keys giống backend/model)
        const formData = {
            _id: studentId,
            HoTen: document.getElementById('student-name').value.trim(), // Lấy Họ tên
            Email: document.getElementById('student-email').value.trim(), // Lấy Email
            SoDienThoai: document.getElementById('student-phone').value.trim(), // Lấy Số điện thoại
            LopSinhHoat: document.getElementById('student-class').value.trim()
            // Thêm các trường khác nếu cần với PascalCase keys
            // NgayThamGia: document.getElementById('student-join-date').value,
            // HinhAnh: document.getElementById('student-image').value
        };

        try {
            // Xác định URL và phương thức HTTP (POST khi thêm, PUT khi sửa)
            const url = currentStudentId
                ? `http://localhost:5000/api/students/${currentStudentId}`
                : 'http://localhost:5000/api/students';

            const method = currentStudentId ? 'PUT' : 'POST';

            // Ghi log dữ liệu gửi đi
            console.log('Sending student data:', formData);

            // Gửi yêu cầu API
            const headers = getAuthHeaders();
            if (!headers) return; // Dừng nếu không có token

            const response = await fetch(url, {
                method,
                headers: headers,
                body: JSON.stringify(formData) // Chuyển dữ liệu form sang JSON string
            });

            const data = await handleApiResponse(response);
            if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

            // Nếu thành công:
            closeModal(); // Đóng modal
            fetchStudents(); // Tải lại danh sách sinh viên để cập nhật hiển thị
            // Hiển thị thông báo thành công
            showSuccess(currentStudentId ? 'Cập nhật thông tin học viên thành công!' : 'Thêm học viên mới thành công!');
        } catch (err) {
            // Xử lý lỗi nếu quá trình gửi yêu cầu hoặc xử lý phản hồi xảy ra lỗi
            console.error('Error saving student:', err);
            // Hiển thị thông báo lỗi cho người dùng
            showError(`Không thể lưu học viên: ${err.message}`);
        }
    }

    // Hàm xử lý xóa sinh viên
    async function deleteStudent(studentId) {
        // Hiển thị confirm box trước khi xóa
        if (!confirm('Bạn có chắc chắn muốn xóa học viên này không?')) {
            return; // Nếu người dùng nhấn Cancel thì dừng
        }

        try {
            // Lấy headers xác thực
            const headers = getAuthHeaders();
            if (!headers) {
                return; // getAuthHeaders đã xử lý chuyển hướng
            }

            // Bước 1: Gửi yêu cầu API backend để kiểm tra trạng thái đăng ký khóa học của sinh viên
            const enrollmentCheckResponse = await fetch(`/api/students/${studentId}/courses`, {
                headers: headers
            });

            // Kiểm tra nếu yêu cầu kiểm tra đăng ký không thành công (sử dụng handleApiResponse)
            const enrollmentData = await handleApiResponse(enrollmentCheckResponse);
            if (!enrollmentData) return; // Dừng nếu có lỗi 401/403 đã được xử lý

            // Kiểm tra nếu sinh viên có trong khóa học nào đó
            if (enrollmentData.isEnrolled) {
                // Nếu sinh viên có khóa học, xây dựng thông báo chi tiết hơn
                let alertMessage = 'Sinh viên đang trong ';
                if (enrollmentData.courses && enrollmentData.courses.length > 0) {
                    // Lấy danh sách tên khóa học và nối lại thành chuỗi
                    const courseNames = enrollmentData.courses.map(course => course.TenKhoaHoc || 'Khóa học không tên').join(', ');
                    alertMessage += `các khóa học sau và không thể xóa:\n${courseNames}`; // Thông báo với danh sách khóa học
                } else {
                    // Trường hợp isEnrolled true nhưng không có dữ liệu khóa học (không nên xảy ra nếu backend đúng)
                    alertMessage += 'khóa học và không thể xóa.'; // Thông báo chung
                }

                alert(alertMessage); // Hiển thị thông báo cho người dùng
                return; // Dừng quá trình xóa nếu sinh viên có khóa học
            }

            // Bước 2: Nếu sinh viên không có trong khóa học nào (isEnrolled là false), tiến hành gửi yêu cầu xóa sinh viên
            const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
                method: 'DELETE',
                headers: headers
            });

            // Kiểm tra nếu phản hồi xóa không thành công (sử dụng handleApiResponse)
            const data = await handleApiResponse(response);
            if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

            // Nếu xóa thành công:
            fetchStudents(); // Tải lại danh sách sinh viên để cập nhật hiển thị
            showSuccess('Xóa học viên thành công!'); // Hiển thị thông báo thành công
        } catch (err) {
            // Xử lý lỗi nếu quá trình gửi yêu cầu hoặc xử lý phản hồi xóa xảy ra lỗi
            console.error('Error deleting student:', err);
            // Hiển thị thông báo lỗi cho người dùng
            showError(`Không thể xóa học viên: ${err.message}`);
        }
    }

    // Hàm tải danh sách sinh viên từ API backend
    const fetchStudents = async () => {
        try {
            // Hiển thị spinner/indicator tải dữ liệu
            loadingElement.style.display = 'flex';
            // Xóa thông báo lỗi cũ
            errorElement.textContent = '';

            console.log('Fetching students from API...');

            // Lấy headers xác thực
            const headers = getAuthHeaders();
            if (!headers) {
                // getAuthHeaders đã xử lý chuyển hướng nếu không có token
                return;
            }

            // Gửi yêu cầu GET đến API lấy danh sách sinh viên với headers xác thực
            const response = await fetch('http://localhost:5000/api/students', {
                headers: headers
            });

            // Kiểm tra nếu phản hồi không thành công (sử dụng handleApiResponse)
            const result = await handleApiResponse(response);
            if (!result) return; // Dừng nếu có lỗi 401/403 đã được xử lý

            // Kiểm tra nếu phản hồi thành công và dữ liệu là một mảng
            if (result.success && Array.isArray(result.data)) {
                allStudents = result.data; // Lưu trữ toàn bộ danh sách sinh viên vào biến state
                displayStudents(allStudents); // Hiển thị danh sách sinh viên lần đầu
                populateClassFilter(allStudents); // Điền dữ liệu cho bộ lọc lớp
            } else {
                // Xử lý trường hợp phản hồi không đúng định dạng hoặc dữ liệu rỗng
                throw new Error('Dữ liệu học viên không hợp lệ hoặc trống.');
            }
        } catch (err) {
            // Xử lý lỗi nếu quá trình tải dữ liệu xảy ra vấn đề
            console.error('Error fetching students:', err);
            // Hiển thị thông báo lỗi cho người dùng
            showError(err.message || 'Không thể tải danh sách học viên. Vui lòng thử lại sau.');
        } finally {
            // Luôn ẩn spinner/indicator tải dữ liệu sau khi hoàn thành (dù thành công hay lỗi)
            loadingElement.style.display = 'none';
        }
    };

    // Hàm hiển thị thông báo lỗi tạm thời trên giao diện
    function showError(message) {
        // Thiết lập nội dung và hiển thị phần tử lỗi
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        // Tùy chỉnh màu sắc cho thông báo lỗi (đã thêm ở các bước trước)
        // errorElement.style.backgroundColor = '#f8d7da'; // Light red background
        // errorElement.style.color = '#721c24'; // Dark red text
        // Ẩn thông báo sau 5 giây
        setTimeout(() => {
            errorElement.style.display = 'none';
            // Reset màu sắc về mặc định sau khi ẩn (nếu có tùy chỉnh)
            // errorElement.style.backgroundColor = '';
            // errorElement.style.color = '';
        }, 5000);
    }

    // Hàm hiển thị thông báo thành công tạm thời trên giao diện
    function showSuccess(message) {
        // Thiết lập nội dung và hiển thị phần tử lỗi (đang dùng chung cho cả lỗi và thành công)
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        // Đặt màu nền và màu chữ cho thông báo thành công
        errorElement.style.backgroundColor = '#4CAF50'; // Xanh lá
        errorElement.style.color = 'white'; // Chữ trắng
        // Ẩn thông báo sau 3 giây
        setTimeout(() => {
            errorElement.style.display = 'none';
            // Reset màu sắc về mặc định sau khi ẩn
            errorElement.style.backgroundColor = '';
            errorElement.style.color = '';
        }, 3000);
    }

    // Đăng ký các hàm vào đối tượng global 'window' để có thể gọi từ các thuộc tính onclick trong HTML
    window.openAddStudentModal = openModal; // Mở modal thêm/sửa từ HTML
    window.closeAddStudentModal = closeModal; // Đóng modal từ HTML

    // Hàm chỉnh sửa sinh viên (được gọi từ onclick trong HTML)
    window.editStudent = async (studentId) => {
        try {
            // Lấy headers xác thực
            const headers = getAuthHeaders();
            if (!headers) {
                return; // getAuthHeaders đã xử lý chuyển hướng
            }
            // Gửi yêu cầu API backend để lấy thông tin chi tiết của 1 sinh viên theo ID
            const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
                headers: headers
            });

            // Kiểm tra nếu phản hồi không thành công
            if (!response.ok) {
                const errorData = await response.json(); // Cố gắng đọc chi tiết lỗi JSON
                console.error('API Error details:', errorData);
                throw new Error(errorData.message || 'Không thể tải thông tin học viên.');
            }

            // Đọc dữ liệu phản hồi (mong đợi JSON { success: boolean, data: { ...studentData } })
            const data = await response.json();

            // Kiểm tra nếu phản hồi thành công và có dữ liệu sinh viên
            if (data.success && data.data) {
                // Mở modal và điền dữ liệu sinh viên vào form
                openModal(data.data); // data.data chứa object sinh viên
            } else {
                // Xử lý trường hợp không nhận được dữ liệu hợp lệ
                throw new Error('Dữ liệu học viên không hợp lệ khi tải thông tin.');
            }
        } catch (err) {
            // Xử lý lỗi nếu có vấn đề khi tải thông tin sinh viên
            console.error('Error fetching student details:', err);
            showError(`Không thể tải thông tin học viên: ${err.message}`);
        }
    };

    // Đăng ký hàm xóa sinh viên vào đối tượng global 'window' để có thể gọi từ onclick trong HTML
    window.deleteStudent = deleteStudent;

    // Chạy hàm fetchStudents khi DOM được tải xong để hiển thị danh sách sinh viên ban đầu
    fetchStudents();
}); 