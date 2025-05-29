// Khởi tạo Flatpickr cho trường ngày sinh
flatpickr("#dateOfBirth", {
  dateFormat: "d/m/Y",  // Định dạng ngày/tháng/năm
  allowInput: true,     // Cho phép nhập tay
  maxDate: "today",     // Không cho chọn ngày tương lai
});

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();

  const studentId = document.getElementById('studentId').value.trim();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const dateOfBirth = document.getElementById('dateOfBirth').value.trim();
  const password = document.getElementById('password').value;

  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = '';

  // Kiểm tra định dạng ngày sinh DD/MM/YYYY
  const dateRegex = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/;
  if (!dateRegex.test(dateOfBirth)) {
    errorMsg.textContent = 'Ngày sinh không đúng định dạng DD/MM/YYYY';
    return;
  }

  // Nếu cần convert ngày sinh sang ISO để gửi backend (YYYY-MM-DD)
  const parts = dateOfBirth.split('/');
  const dateOfBirthISO = `${parts[2]}-${parts[1]}-${parts[0]}`;

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        name,
        email,
        phone,
        dateOfBirth: dateOfBirthISO,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || 'Đăng ký thất bại';
    } else {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      window.location.href = 'login.html';
    }
  } catch (err) {
    errorMsg.textContent = 'Lỗi mạng, vui lòng thử lại.';
  }
});
