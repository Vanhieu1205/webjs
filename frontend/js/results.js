// Helper function to get DOM elements safely
const getElement = (id) => document.getElementById(id);

// Function to display results in the table
function displayResults(results) {
  const resultsTableBody = getElement('results-table-body');
  if (!resultsTableBody) return;

  resultsTableBody.innerHTML = ''; // Clear previous results

  if (results.length === 0) {
    resultsTableBody.innerHTML = '<tr><td colspan="4">Không tìm thấy kết quả nào.</td></tr>';
    return;
  }

  results.forEach(result => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${result.course ? result.course.TenKhoaHoc || 'N/A' : 'N/A (Khóa học đã xóa)'}</td>
            <td>${result.student ? result.student.HoTen || 'N/A' : 'N/A (Sinh viên đã xóa)'}</td>
            <td>${result.score !== null && result.score !== undefined ? result.score : 'Chưa nhập'}</td>
            <td>${result.updatedAt ? new Date(result.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
        `;
    resultsTableBody.appendChild(row);
  });
}

// Function to fetch all results from the backend
async function fetchAllResults() {
  const loadingElement = getElement('loading');
  const errorElement = getElement('error');
  const resultsTable = getElement('results-table');

  if (loadingElement) loadingElement.style.display = 'flex';
  if (errorElement) errorElement.textContent = '';
  if (resultsTable) resultsTable.classList.add('hidden'); // Hide table while loading

  try {
    const response = await fetch('/api/results');
    const data = await response.json();

    if (data.success) {
      // Store results globally or handle filtering here if needed
      displayResults(data.data); // Display all fetched results initially
      if (resultsTable) resultsTable.classList.remove('hidden'); // Show table
    } else {
      console.error('Error fetching all results:', data.message);
      showError(data.message || 'Lỗi khi tải danh sách kết quả.');
    }
  } catch (error) {
    console.error('Error fetching all results:', error);
    showError('Lỗi khi tải danh sách kết quả.');
  } finally {
    if (loadingElement) loadingElement.style.display = 'none';
  }
}

// Function to filter results based on search input
function filterResults() {
  const searchInput = getElement('result-search');
  if (!searchInput) return;

  const searchValue = searchInput.value.toLowerCase();
  // To filter, we need the full list of results. We should store it globally.
  // Let's adjust fetchAllResults to store the data.
}

// Modified fetchAllResults to store data globally for filtering
let allResults = []; // Global variable to store all results

async function fetchAndStoreAllResults() {
  const loadingElement = getElement('loading');
  const errorElement = getElement('error');
  const resultsTable = getElement('results-table');

  if (loadingElement) loadingElement.style.display = 'flex';
  if (errorElement) errorElement.textContent = '';
  if (resultsTable) resultsTable.classList.add('hidden'); // Hide table while loading

  try {
    const response = await fetch('/api/results');
    const data = await response.json();

    if (data.success) {
      allResults = data.data; // Store all results globally
      displayResults(allResults); // Display all fetched results initially
      if (resultsTable) resultsTable.classList.remove('hidden'); // Show table
    } else {
      console.error('Error fetching all results:', data.message);
      showError(data.message || 'Lỗi khi tải danh sách kết quả.');
    }
  } catch (error) {
    console.error('Error fetching all results:', error);
    showError('Lỗi khi tải danh sách kết quả.');
  } finally {
    if (loadingElement) loadingElement.style.display = 'none';
  }
}

// Updated filterResults to use global allResults
function filterResults() {
  const searchInput = getElement('result-search');
  if (!searchInput) return;

  const searchValue = searchInput.value.toLowerCase();
  const filteredResults = allResults.filter(result =>
    (result.student && result.student.HoTen && result.student.HoTen.toLowerCase().includes(searchValue)) ||
    (result.course && result.course.TenKhoaHoc && result.course.TenKhoaHoc.toLowerCase().includes(searchValue))
  );
  displayResults(filteredResults);
}

// Initial load and event listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchAndStoreAllResults(); // Fetch and display all results on load

  const searchInput = getElement('result-search');
  if (searchInput) {
    searchInput.addEventListener('input', filterResults);
  }

  // Add showError and showSuccess functions here or ensure they are global
  // For simplicity, let's make them global.
});

// Expose global functions (if any are needed by HTML onclick/oninput, though none are planned for this page currently)
// window.someFunction = someFunction; // Example

// Re-defining showError and showSuccess in global scope for use in fetch functions
function showError(message) {
  const errorElement = getElement('error');
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.backgroundColor = '#f8d7da'; // Light red background
  errorElement.style.color = '#721c24'; // Dark red text
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

function showSuccess(message) {
  const errorElement = getElement('error'); // Using the same element for simplicity
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.backgroundColor = '#d4edda'; // Light green background
  errorElement.style.color = '#155724'; // Dark green text
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 3000);
}
