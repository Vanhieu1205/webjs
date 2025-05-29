const urlParams = new URLSearchParams(window.location.search);
const maSupport = urlParams.get('id'); // Đã fix

document.getElementById('maSupport').value = maSupport;

// Lấy dữ liệu để hiển thị
fetch('/api/supports')
  .then(res => res.json())
  .then(responseData => {
    // Kiểm tra nếu response thành công và data là mảng
    if (responseData.success && Array.isArray(responseData.data)) {
      const support = responseData.data.find(s => s._id === maSupport);

      if (!support) return alert('Không tìm thấy Support!');
      const form = document.getElementById('editSupportForm');
      form.hoTen.value = support.hoTen;
      form.lopSinhHoat.value = support.lopSinhHoat;
      form.soDienThoai.value = support.soDienThoai;
      form.email.value = support.email;
    } else {
      // Xử lý trường hợp response không thành công hoặc dữ liệu không hợp lệ
      alert('Lỗi tải dữ liệu support: ' + (responseData.message || 'Dữ liệu không đúng định dạng.'));
    }
  });

// Submit form cập nhật
document.getElementById('editSupportForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  fetch('/api/supports/' + maSupport, {
    method: 'PUT',
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error('Cập nhật thất bại');
      alert('Cập nhật thành công');
      window.location.href = 'support.html';
    })
    .catch(err => alert(err));
});
