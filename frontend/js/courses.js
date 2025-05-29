// Biến trạng thái toàn cục
let currentCourseId = null;
let allCourses = []; // Danh sách tất cả khóa học

// Hàm tiện ích để lấy phần tử DOM an toàn
const getElement = (id) => document.getElementById(id);

// Hàm lấy token từ localStorage và cấu hình header
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Nếu không có token, chuyển hướng về trang đăng nhập
        window.location.href = 'login.html';
        return null; // Trả về null để hàm gọi fetch dừng lại
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Hàm xử lý phản hồi từ API (bao gồm lỗi 401/403)
async function handleApiResponse(response) {
    if (response.status === 401 || response.status === 403) {
        alert('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
        localStorage.clear(); // Xóa token và thông tin user
        window.location.href = 'login.html';
        return null; // Hoặc throw new Error('Unauthorized');
    }
    // Xử lý các lỗi khác hoặc trả về dữ liệu
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Các hàm cập nhật giao diện
function displayCourses(courses) {
    const coursesGrid = getElement('courses-grid');
    const cardTemplate = getElement('course-card-template');
    if (!coursesGrid || !cardTemplate) return;

    coursesGrid.innerHTML = '';

    // Lấy thông tin user từ localStorage và kiểm tra role
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    courses.forEach(course => {
        const clone = document.importNode(cardTemplate.content, true);

        // Hàm tiện ích để thiết lập text cho các phần tử
        const setText = (selector, text) => {
            const el = clone.querySelector(selector);
            if (el) el.textContent = text || '';
        };
        // Hàm tiện ích để thiết lập src cho các phần tử hình ảnh
        const setSrc = (selector, src, alt) => {
            const el = clone.querySelector(selector);
            if (el) { el.src = src || ''; el.alt = alt || ''; }
        };

        // Điền thông tin khóa học vào template
        setText('[data-course-name]', course.TenKhoaHoc);
        setText('[data-course-description]', course.MoTa);
        setText('[data-course-start-date]', course.NgayBatDau ? new Date(course.NgayBatDau).toLocaleDateString('vi-VN') : '');
        setText('[data-course-end-date]', course.NgayKetThuc ? new Date(course.NgayKetThuc).toLocaleDateString('vi-VN') : '');
        setSrc('[data-course-image]', course.image ? `/images/${course.image}` : '', course.TenKhoaHoc);

        // Thiết lập sự kiện cho nút xem chi tiết
        const detailsButton = clone.querySelector('[data-details-button]');
        detailsButton.onclick = () => {
            window.location.href = `/course-details.html?id=${course._id}`;
        };

        // Thiết lập sự kiện cho các nút chỉnh sửa và xóa
        const editButton = clone.querySelector('[data-edit-button]');
        const deleteButton = clone.querySelector('[data-delete-button]');

        // Chỉ hiển thị nút Sửa và Xóa cho Admin
        if (isAdmin) {
            if (editButton) {
                editButton.onclick = () => openAddCourseModal(course);
                editButton.style.display = 'inline-block';
            }

            if (deleteButton) {
                deleteButton.onclick = () => deleteCourse(course._id);
                deleteButton.style.display = 'inline-block';
            }
        } else {
            // Ẩn nút Sửa và Xóa nếu không phải Admin
            if (editButton) editButton.style.display = 'none';
            if (deleteButton) deleteButton.style.display = 'none';
        }

        coursesGrid.appendChild(clone);
    });
}

// Hàm lọc khóa học theo từ khóa tìm kiếm
function filterCourses() {
    const searchInput = getElement('search-input');
    if (!searchInput) return;
    const searchValue = searchInput.value.toLowerCase();
    const filteredCourses = allCourses.filter(course =>
        (course.TenKhoaHoc && course.TenKhoaHoc.toLowerCase().includes(searchValue)) ||
        (course.MoTa && course.MoTa.toLowerCase().includes(searchValue))
    );
    displayCourses(filteredCourses);
}

// Hàm hiển thị thông báo lỗi
function showError(message) {
    const errorElement = getElement('error');
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.backgroundColor = '#f8d7da';
    errorElement.style.color = '#721c24';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Hàm hiển thị thông báo thành công
function showSuccess(message) {
    const errorElement = getElement('error');
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.backgroundColor = '#d4edda';
    errorElement.style.color = '#155724';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// Các hàm tương tác với API
async function fetchCourses() {
    try {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'flex';

        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch('/api/courses', {
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            allCourses = data.data; // Cập nhật danh sách khóa học toàn cục
            displayCourses(allCourses); // Cập nhật giao diện
        } else {
            console.error('Error fetching courses:', data.message);
            showError(data.message || 'Lỗi khi tải danh sách khóa học. Vui lòng thử lại sau.');
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
        showError(error.message || 'Lỗi khi tải danh sách khóa học. Vui lòng thử lại sau.');
    } finally {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

// Hàm xử lý khi submit form khóa học
async function handleCourseFormSubmit(event) {
    event.preventDefault();

    try {
        const url = currentCourseId
            ? `/api/courses/${currentCourseId}`
            : '/api/courses';

        const method = currentCourseId ? 'PUT' : 'POST';

        const formData = new FormData();
        const courseNameInput = getElement('course-name');
        const courseDescriptionInput = getElement('course-description');
        const startDateInput = getElement('course-start-date');
        const endDateInput = getElement('course-end-date');
        const imageInput = getElement('course-image');

        // Lấy dữ liệu từ form
        if (courseNameInput) formData.append('TenKhoaHoc', courseNameInput.value);
        if (courseDescriptionInput) formData.append('MoTa', courseDescriptionInput.value);

        // Xử lý ngày bắt đầu
        if (startDateInput && startDateInput.value) {
            formData.append('NgayBatDau', new Date(startDateInput.value).toISOString());
        } else if (!currentCourseId) {
            showError('Vui lòng nhập ngày bắt đầu.');
            return;
        }

        // Xử lý ngày kết thúc
        if (endDateInput && endDateInput.value) {
            formData.append('NgayKetThuc', new Date(endDateInput.value).toISOString());
        } else if (!currentCourseId) {
            showError('Vui lòng nhập ngày kết thúc.');
            return;
        }

        // Xử lý hình ảnh
        const imageFile = imageInput ? imageInput.files[0] : null;
        const courseName = courseNameInput ? courseNameInput.value : '';

        if (!currentCourseId && !imageFile) {
            showError('Vui lòng thêm hình ảnh cho khóa học mới.');
            return;
        }

        if (imageFile && courseName) {
            const fileExtension = imageFile.name.split('.').pop();
            const newFileName = `${courseName}.${fileExtension}`;
            const renamedFile = new File([imageFile], newFileName, { type: imageFile.type });
            formData.append('image', renamedFile);
        } else if (imageFile && !courseName) {
            showError('Vui lòng nhập Tên khóa học trước khi chọn ảnh.');
            return;
        }

        // Gửi yêu cầu API
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        // Remove Content-Type header if it exists, as FormData sets it automatically
        delete headers['Content-Type'];

        const response = await fetch(url, {
            method,
            headers: headers,
            body: formData
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        closeCourseModal();
        fetchCourses(); // Cập nhật lại danh sách khóa học
        showSuccess(currentCourseId ? 'Cập nhật khóa học thành công!' : 'Thêm khóa học mới thành công!');
    } catch (err) {
        console.error('Error saving course:', err);
        showError(`Không thể lưu khóa học: ${err.message}`);
    }
}

// Hàm xóa khóa học
async function deleteCourse(courseId) {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;

    try {
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            fetchCourses(); // Cập nhật lại danh sách khóa học
            showSuccess('Xóa khóa học thành công!');
        } else {
            console.error('Error deleting course:', data.message);
            showError(data.message || 'Không thể xóa khóa học.');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        showError('Lỗi khi xóa khóa học');
    }
}

// Các hàm xử lý modal
function openAddCourseModal(course = null) {
    const modal = getElement('course-modal');
    const title = modal ? modal.querySelector('#modal-title') : null;
    const form = getElement('course-form');
    const submitButton = modal ? modal.querySelector('button[type="submit"]') : null;
    const courseNameInput = getElement('course-name');
    const courseDescriptionInput = getElement('course-description');
    const startDateInput = getElement('course-start-date');
    const endDateInput = getElement('course-end-date');

    currentCourseId = course ? course._id : null;

    // Thiết lập tiêu đề và nút submit
    if (title) title.textContent = course ? 'Sửa khóa học' : 'Thêm khóa học mới';
    if (submitButton) {
        submitButton.textContent = course ? 'Cập nhật' : 'Lưu';
    }

    // Điền dữ liệu vào form nếu đang sửa
    if (course) {
        if (courseNameInput) courseNameInput.value = course.TenKhoaHoc || '';
        if (courseDescriptionInput) courseDescriptionInput.value = course.MoTa || '';
        if (startDateInput) startDateInput.value = course.NgayBatDau ? new Date(course.NgayBatDau).toISOString().split('T')[0] : '';
        if (endDateInput) endDateInput.value = course.NgayKetThuc ? new Date(course.NgayKetThuc).toISOString().split('T')[0] : '';
    } else {
        if (form) form.reset();
    }

    if (modal) modal.classList.add('active');
}

function closeCourseModal() {
    const modal = getElement('course-modal');
    const form = getElement('course-form');
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
    currentCourseId = null;
    const submitButton = modal ? modal.querySelector('button[type="submit"]') : null;
    if (submitButton) {
        submitButton.textContent = 'Lưu';
    }
}

// Thêm kiểm tra role cho nút Thêm khóa học
const addCourseBtn = getElement('add-course-button'); // Đảm bảo ID nút Thêm khóa học là 'add-course-button'

if (addCourseBtn) {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    if (isAdmin) {
        addCourseBtn.addEventListener('click', () => openAddCourseModal());
        addCourseBtn.style.display = 'inline-block'; // Hiển thị nút
    } else {
        addCourseBtn.style.display = 'none'; // Ẩn nút
    }
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM
    const searchInput = getElement('search-input');
    const courseForm = getElement('course-form');

    // Thêm các event listener
    if (searchInput) {
        searchInput.addEventListener('input', filterCourses);
    }

    if (courseForm) {
        courseForm.addEventListener('submit', handleCourseFormSubmit);
    }

    // Tải danh sách khóa học ban đầu
    fetchCourses();
});