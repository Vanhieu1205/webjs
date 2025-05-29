// Global state variables
// const loginLogoutItem = document.getElementById('login-logout-item');
// if (!loginLogoutItem) {
//   console.warn('Không tìm thấy phần tử #login-logout-item trong header.');
// }

// Lấy trạng thái đăng nhập và username từ localStorage
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
const username = localStorage.getItem('username') || '';

// Lấy tất cả các link trong menu điều hướng
const menuLinks = document.querySelectorAll('nav.nav-menu ul li a');

// Functions to update UI elements
function displayCourseDetails(course, students, supports) {
  // ... existing code ...
}

function initHeader() {
  const loginLogoutItem = document.getElementById('login-logout-item');
  if (!loginLogoutItem) {
    console.warn('Không tìm thấy phần tử #login-logout-item trong header.');
    return; // Thoát hàm nếu không tìm thấy phần tử
  }

  if (isLoggedIn) {
    // Nếu đã đăng nhập, hiển thị username và nút logout
    loginLogoutItem.innerHTML = `
      <span style="font-weight: 600; margin-right: 8px; color:#fff;">${username}</span>
      <a href="#" id="logout-link" style="color: white; text-decoration: underline; cursor: pointer;">Logout</a>
    `;

    // Gắn sự kiện logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', e => {
        e.preventDefault();
        // Xóa dữ liệu đăng nhập
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('token'); // nếu bạn lưu token
        // Điều hướng về trang đăng nhập
        window.location.href = 'login.html';
      });
    }

    // Đã đăng nhập thì không chặn link nào
  } else {
    // Chưa đăng nhập, hiển thị link đăng nhập
    loginLogoutItem.innerHTML = `
      <a href="login.html" style="color: white; text-decoration: underline;">Login</a>
    `;

    // Chặn tất cả các link khác ngoài login.html và anchor (#)
    menuLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (
        href &&
        !href.toLowerCase().includes('login.html') &&
        !href.startsWith('#')
      ) {
        link.addEventListener('click', e => {
          e.preventDefault();
          window.location.href = 'login.html';
        });
      }
    });
  }
}