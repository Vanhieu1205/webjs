document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();

  const studentId = document.getElementById('studentId').value.trim();
  const password = document.getElementById('password').value;

  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = '';

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || 'Đăng nhập thất bại';
    } else {
      // Lưu đồng bộ các giá trị đăng nhập
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('username', data.user.name); // thêm lưu username riêng
      localStorage.setItem('isLoggedIn', 'true');       // thêm cờ đăng nhập

      alert('Đăng nhập thành công!');
      window.location.href = 'home.html'; // Thay bằng trang bạn muốn sau đăng nhập
    }
  } catch (err) {
    errorMsg.textContent = 'Lỗi mạng, vui lòng thử lại.';
  }
});
