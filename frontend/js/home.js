document.addEventListener('DOMContentLoaded', () => {
  fetch('./header.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('header-container').innerHTML = html;

      // Gọi hàm khởi tạo login/logout sau khi chèn header
      setTimeout(() => {
        if (typeof initHeader === 'function') {
          initHeader();
        }
      }, 0);

      // Tô đậm menu Home nếu cần
      const menuItems = document.querySelectorAll('nav.nav-menu ul li a');
      menuItems.forEach(item => {
        if (item.textContent.trim() === 'Home') {
          item.style.fontWeight = 'bold';
          item.style.textDecoration = 'underline';
        }
      });
    })
    .catch(err => console.warn('Không tải được header:', err));
});
