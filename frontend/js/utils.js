// frontend/js/utils.js

// Hàm lấy token từ localStorage và cấu hình header
export function getAuthHeaders() {
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
export async function handleApiResponse(response) {
    if (response.status === 401 || response.status === 403) {
        alert('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
        localStorage.clear(); // Xóa token và thông tin user
        window.location.href = 'login.html';
        return null; // Hoặc throw new Error('Unauthorized');
    }

    // Nếu phản hồi không thành công (status code ngoài 2xx)
    if (!response.ok) {
        let errorDetails = 'Lỗi không xác định.';
        try {
            // Thử đọc body JSON nếu có
            const errorData = await response.json();
            errorDetails = errorData.message || JSON.stringify(errorData);
        } catch (e) {
            // Nếu không đọc được JSON, sử dụng status text
            errorDetails = response.statusText || `HTTP error! status: ${response.status}`;
        }
        // Ném lỗi với thông tin chi tiết hơn
        throw new Error(`Lỗi API: ${errorDetails}`);
    }

    // Nếu phản hồi thành công, trả về body JSON
    return response.json();
} 