import { getAuthHeaders, handleApiResponse } from './utils.js';

// Biến trạng thái toàn cục
let currentCourseId = null;
let currentCourse = null; // Lưu trữ thông tin khóa học hiện tại
let allStudents = []; // Danh sách tất cả học viên cho modal thêm
let allSupports = []; // Danh sách tất cả support cho modal thêm

// Hàm tiện ích để lấy phần tử DOM an toàn
const getElement = (id) => document.getElementById(id);

// Các hàm cập nhật giao diện
function displayCourseDetails(course, students, supports) {
    const courseDetailsName = getElement('course-details-name');
    const studentsList = getElement('students-list');
    const supportsList = getElement('supports-list');

    if (courseDetailsName) courseDetailsName.textContent = course.TenKhoaHoc || '';

    // Hiển thị danh sách học viên
    if (studentsList) {
        studentsList.innerHTML = students.map(student => {
            // Lấy thông tin user từ localStorage và kiểm tra role
            const user = JSON.parse(localStorage.getItem('user'));
            const isAdmin = user && user.role === 'admin';

            let studentActionsHtml = '';
            if (isAdmin) {
                studentActionsHtml += `<button class="remove-button" onclick="removeStudentFromCourse('${currentCourseId}', '${student._id}')"><i class="fas fa-times"></i></button>`;
                studentActionsHtml += `<button class="result-button" onclick="openResultModal('${student._id}', '${student.HoTen || 'N/A'}')"><i class="fas fa-clipboard"></i> Kết quả</button>`;
            }

            return `
            <div class="list-item">
                <div class="item-info">
                    <span class="item-name">${student.HoTen || 'N/A'}</span>
                    <span class="item-id">${student._id || 'N/A'}</span>
                </div>
                <div class="item-actions">
                    ${studentActionsHtml}
                </div>
            </div>
        `;
        }).join('');
    }

    // Hiển thị danh sách support
    if (supportsList) {
        supportsList.innerHTML = supports.map(support => {
            // Lấy thông tin user từ localStorage và kiểm tra role
            const user = JSON.parse(localStorage.getItem('user'));
            const isAdmin = user && user.role === 'admin';

            let supportActionsHtml = '';
            if (isAdmin) {

                supportActionsHtml += `<button class="remove-button" onclick="removeSupportFromCourse('${currentCourseId}', '${support._id}')"><i class="fas fa-times"></i></button>`;
            }

            return `
            <div class="list-item">
                <div class="item-info">
                    <span class="item-name">${support.hoTen || 'N/A'}</span>
                    <span class="item-id">${support._id || 'N/A'}</span>
                </div>
                ${supportActionsHtml}
            </div>
        `;
        }).join('');
    }
}

// Hàm hiển thị danh sách học viên có thể thêm vào khóa học
function displayAvailableStudents() {
    const availableStudentsList = getElement('available-students');
    if (!availableStudentsList || !currentCourse) return;

    const studentSearch = getElement('student-search');
    const searchValue = studentSearch ? studentSearch.value.toLowerCase() : '';

    // Lọc học viên chưa có trong khóa học và phù hợp với từ khóa tìm kiếm
    const available = allStudents.filter(student =>
        currentCourse && !currentCourse.students.includes(student._id) &&
        ((student.HoTen && student.HoTen.toLowerCase().includes(searchValue)) ||
            (student._id && student._id.toLowerCase().includes(searchValue)))
    );

    // Lấy thông tin user từ localStorage để chỉ hiển thị danh sách cho user đã đăng nhập
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        availableStudentsList.innerHTML = available.map(student => `
        <div class="list-item" onclick="addStudentToCourse('${currentCourseId}', '${student._id}')" >
            <div class="item-info">
                <span class="item-name">${student.HoTen || 'N/A'}</span>
                <span class="item-id">${student._id || 'N/A'}</span>
            </div>
        </div>
        `).join('');
    } else {
        availableStudentsList.innerHTML = ''; // Ẩn danh sách nếu chưa đăng nhập
    }
}

// Hàm hiển thị danh sách support có thể thêm vào khóa học
function displayAvailableSupports() {
    const availableSupportsList = getElement('available-supports');
    if (!availableSupportsList || !currentCourse) return;

    const supportSearch = getElement('support-search');
    const searchValue = supportSearch ? supportSearch.value.toLowerCase() : '';

    // Lọc support chưa có trong khóa học và phù hợp với từ khóa tìm kiếm
    const available = allSupports.filter(support =>
        currentCourse && !currentCourse.supports.includes(support._id) &&
        ((support.hoTen && support.hoTen.toLowerCase().includes(searchValue)) ||
            (support._id && support._id.toLowerCase().includes(searchValue)))
    );

    // Lấy thông tin user từ localStorage để chỉ hiển thị danh sách cho user đã đăng nhập
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        availableSupportsList.innerHTML = available.map(support => `
        <div class="list-item" onclick="addSupportToCourse('${currentCourseId}', '${support._id}')" >
            <div class="item-info">
                <span class="item-name">${support.hoTen || 'N/A'}</span>
                <span class="item-id">${support._id || 'N/A'}</span>
            </div>
        </div>
        `).join('');
    } else {
        availableSupportsList.innerHTML = ''; // Ẩn danh sách nếu chưa đăng nhập
    }
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
async function fetchCourseDetails(courseId) {
    try {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'flex';

        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch(`/api/courses/${courseId}/details`, {
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            currentCourse = data.data.course; // Lưu thông tin khóa học vào biến toàn cục
            displayCourseDetails(data.data.course, data.data.students, data.data.supports);
        } else {
            console.error('Error fetching course details:', data.message);
            showError(data.message || 'Không thể tải chi tiết khóa học.');
        }
    } catch (error) {
        console.error('Error fetching course details:', error);
        showError('Lỗi khi tải thông tin khóa học');
    } finally {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

// Hàm lấy danh sách học viên từ API
async function fetchStudents() {
    try {
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch('/api/students', {
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            allStudents = data.data; // Cập nhật danh sách học viên toàn cục
            displayAvailableStudents(); // Cập nhật giao diện
        } else {
            console.error('Error fetching students:', data.message);
            alert('Lỗi khi tải danh sách học viên: ' + (data.message || ''));
        }
    } catch (error) {
        console.error('Error fetching students:', error);
        alert('Lỗi khi tải danh viên');
    }
}

// Hàm lấy danh sách support từ API
async function fetchSupports() {
    try {
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch('/api/supports', {
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        console.log('API supports response data:', data);
        if (data.success) {
            allSupports = data.data; // Cập nhật danh sách support toàn cục
            displayAvailableSupports(); // Cập nhật giao diện
        } else {
            console.error('Error fetching supports:', data.message);
            alert('Lỗi khi tải danh sách support: ' + (data.message || ''));
        }
    } catch (error) {
        console.error('Error fetching supports:', error);
        alert('Lỗi khi tải danh sách support');
    }
}

// Hàm thêm học viên vào khóa học
async function addStudentToCourse(courseId, studentId) {
    console.log('Attempting to add student', studentId, 'to course', courseId);
    try {
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch(`/api/courses/${courseId}/students`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ studentId })
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            showSuccess(data.message || 'Thêm học viên thành công!');
            closeAddStudentModal();
            fetchCourseDetails(courseId); // Cập nhật lại chi tiết khóa học
        } else {
            console.error('Error adding student:', data.message);
            alert('Lỗi: ' + (data.message || 'Không thể thêm học viên. và quyền của bạn không hợp lệ')); // Thêm thông báo lỗi chi tiết hơn
        }
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Lỗi khi thêm học viên');
    }
}

// Hàm thêm support vào khóa học
async function addSupportToCourse(courseId, supportId) {
    console.log('Attempting to add support', supportId, 'to course', courseId);
    try {
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch(`/api/courses/${courseId}/supports`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ supportId })
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            showSuccess(data.message || 'Thêm support thành công!');
            closeAddSupportModal();
            fetchCourseDetails(courseId); // Cập nhật lại chi tiết khóa học
        } else {
            console.error('Error adding support:', data.message);
            alert('Lỗi: ' + (data.message || 'Không thể thêm support. và quyền của bạn không hợp lệ')); // Thêm thông báo lỗi chi tiết hơn
        }
    } catch (error) {
        console.error('Error adding support:', error);
        alert('Lỗi khi thêm support');
    }
}

// Hàm xóa học viên khỏi khóa học
async function removeStudentFromCourse(courseId, studentId) {
    if (!confirm('Bạn có chắc chắn muốn xóa học viên này khỏi khóa học?')) return;
    try {
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch(`/api/courses/${courseId}/students/${studentId}`, {
            method: 'DELETE',
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            showSuccess(data.message || 'Xóa học viên thành công!');
            fetchCourseDetails(courseId); // Cập nhật lại chi tiết khóa học
        } else {
            console.error('Error removing student:', data.message);
            alert('Lỗi: ' + (data.message || 'Không thể xóa học viên. và quyền của bạn không hợp lệ')); // Thêm thông báo lỗi chi tiết hơn
        }
    } catch (error) {
        console.error('Error removing student:', error);
        alert('Lỗi khi xóa học viên');
    }
}

// Hàm xóa support khỏi khóa học
async function removeSupportFromCourse(courseId, supportId) {
    if (!confirm('Bạn có chắc chắn muốn xóa support này khỏi khóa học?')) return;
    try {
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch(`/api/courses/${courseId}/supports/${supportId}`, {
            method: 'DELETE',
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            showSuccess(data.message || 'Xóa support thành công!');
            fetchCourseDetails(courseId); // Cập nhật lại chi tiết khóa học
        } else {
            console.error('Error removing support:', data.message);
            alert('Lỗi: ' + (data.message || 'Không thể xóa support. và quyền của bạn không hợp lệ')); // Thêm thông báo lỗi chi tiết hơn
        }
    } catch (error) {
        console.error('Error removing support:', error);
        alert('Lỗi khi xóa support');
    }
}

// Hàm lấy kết quả học tập của học viên
async function fetchResult(studentId, courseId) {
    try {
        const headers = getAuthHeaders();
        if (!headers) return null; // Dừng nếu không có token

        const response = await fetch(`/api/results/${courseId}/${studentId}`, {
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return null; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            return data.data.score; // Trả về điểm số hoặc null nếu không tìm thấy
        } else {
            console.error('Error fetching result:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching result:', error);
        return null;
    }
}

// Hàm lưu kết quả học tập
async function saveResult() {
    try {
        // Lấy giá trị từ các input ẩn
        const studentId = getElement('result-student-id').value;
        const courseId = getElement('result-course-id').value;
        const scoreInput = getElement('student-score');
        const score = parseFloat(scoreInput.value);

        // Ghi log để kiểm tra giá trị
        console.log('Saving result:');
        console.log('Student ID:', studentId);
        console.log('Course ID:', courseId);
        console.log('Score:', score);

        if (!studentId || !courseId || isNaN(score)) {
            showError('Dữ liệu kết quả không hợp lệ.');
            return;
        }

        if (score < 0 || score > 10) {
            showError('Điểm phải nằm trong khoảng từ 0 đến 10.');
            return;
        }

        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch('/api/results', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ courseId: courseId, studentId: studentId, score: score })
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            showSuccess(data.message || 'Lưu kết quả thành công!');
            closeResultModal();
            fetchCourseDetails(currentCourseId); // Cập nhật lại chi tiết khóa học
        } else {
            showError(data.message || 'Lỗi khi lưu kết quả.');
        }
    } catch (error) {
        console.error('Error saving result:', error);
        showError('Lỗi khi lưu kết quả.');
    }
}

// Các hàm xử lý modal
function openAddStudentModal() {
    // Lấy thông tin user từ localStorage và kiểm tra role
    const user = JSON.parse(localStorage.getItem('user'));
    // const isAdmin = user && user.role === 'admin'; // Không cần kiểm tra admin nữa

    // Chỉ mở modal nếu user đã đăng nhập
    if (user) {
        const modal = getElement('add-student-modal');
        if (modal) modal.classList.add('active');
        fetchStudents(); // Lấy danh sách học viên và cập nhật hiển thị
    } else {
        // Hiển thị thông báo cần đăng nhập
        showError('Vui lòng đăng nhập để thêm học viên.');
    }
}

function closeAddStudentModal() {
    const modal = getElement('add-student-modal');
    const studentSearch = getElement('student-search');
    const availableStudentsList = getElement('available-students');
    if (modal) modal.classList.remove('active');
    if (studentSearch) studentSearch.value = '';
    if (availableStudentsList) availableStudentsList.innerHTML = '';
}

function openAddSupportModal() {
    // Lấy thông tin user từ localStorage và kiểm tra role
    const user = JSON.parse(localStorage.getItem('user'));
    // const isAdmin = user && user.role === 'admin'; // Không cần kiểm tra admin nữa

    // Chỉ mở modal nếu user đã đăng nhập
    if (user) {
        const modal = getElement('add-support-modal');
        if (modal) modal.classList.add('active');
        fetchSupports(); // Lấy danh sách support và cập nhật hiển thị
    } else {
        // Hiển thị thông báo cần đăng nhập
        showError('Vui lòng đăng nhập để thêm support.');
    }
}

function closeAddSupportModal() {
    const modal = getElement('add-support-modal');
    const supportSearch = getElement('support-search');
    const availableSupportsList = getElement('available-supports');
    if (modal) modal.classList.remove('active');
    if (supportSearch) supportSearch.value = '';
    if (availableSupportsList) availableSupportsList.innerHTML = '';
}

// Hàm mở modal kết quả học tập
async function openResultModal(studentId, studentName) {
    // Lấy thông tin user từ localStorage và kiểm tra role
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    // Chỉ mở modal nếu là Admin
    if (!currentCourse || !currentCourseId || !isAdmin) {
        showError('Bạn không có quyền xem hoặc chỉnh sửa kết quả.');
        return;
    }

    const modal = getElement('result-modal');
    const studentNameElement = getElement('result-student-name');
    const courseNameElement = getElement('result-course-name');
    const studentScoreInput = getElement('student-score');
    const resultStudentIdInput = getElement('result-student-id');
    const resultCourseIdInput = getElement('result-course-id');

    if (!modal || !studentNameElement || !courseNameElement || !studentScoreInput || !resultStudentIdInput || !resultCourseIdInput) {
        console.error('Result modal elements not found.');
        showError('Lỗi: Không tìm thấy các phần tử modal kết quả.');
        return;
    }

    // Thiết lập nội dung modal
    studentNameElement.textContent = studentName;
    courseNameElement.textContent = currentCourse.TenKhoaHoc || 'N/A';
    resultStudentIdInput.value = studentId;
    resultCourseIdInput.value = currentCourseId;

    // Lấy và hiển thị điểm số hiện tại
    const existingScore = await fetchResult(studentId, currentCourseId);
    studentScoreInput.value = existingScore !== null && existingScore !== undefined ? existingScore : '';

    modal.classList.add('active');
}

function closeResultModal() {
    const modal = getElement('result-modal');
    const studentScoreInput = getElement('student-score');
    if (modal) modal.classList.remove('active');
    if (studentScoreInput) studentScoreInput.value = '';
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (courseId) {
        currentCourseId = courseId; // Thiết lập ID khóa học hiện tại
        fetchCourseDetails(courseId);

        // Thêm event listener cho các input tìm kiếm trong modal
        const studentSearch = getElement('student-search');
        if (studentSearch) {
            studentSearch.addEventListener('input', displayAvailableStudents);
        }

        const supportSearch = getElement('support-search');
        if (supportSearch) {
            supportSearch.addEventListener('input', displayAvailableSupports);
        }

        // Lấy thông tin user và kiểm tra vai trò để ẩn/hiện nút 'Thêm support'
        const user = JSON.parse(localStorage.getItem('user'));
        const isAdmin = user && user.role === 'admin';
        const addSupportButton = document.querySelector('.supports-section .add-button');

        if (addSupportButton && !isAdmin) {
            addSupportButton.style.display = 'none'; // Ẩn nút nếu không phải admin
        }

    } else {
        showError('Không tìm thấy ID khóa học trong URL.');
    }
});

// Đăng ký các hàm vào đối tượng window để có thể gọi từ HTML
window.openAddStudentModal = openAddStudentModal;
window.closeAddStudentModal = closeAddStudentModal;
window.openAddSupportModal = openAddSupportModal;
window.closeAddSupportModal = closeAddSupportModal;
window.addStudentToCourse = addStudentToCourse;
window.addSupportToCourse = addSupportToCourse;
window.removeStudentFromCourse = removeStudentFromCourse;
window.removeSupportFromCourse = removeSupportFromCourse;
window.openResultModal = openResultModal;
window.closeResultModal = closeResultModal;
window.saveResult = saveResult; 