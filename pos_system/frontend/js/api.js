// API Configuration and Utility Functions

// window.location.port is empty on standard ports (e.g. HTTPS on Vercel),
// so only include the ":port" segment when a non-default port is present.
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/api`;

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Unauthorized - redirect to login
      this.clearToken();
      window.location.href = '/frontend/pages/login.html';
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  // Auth endpoints
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  async changePassword(oldPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async registerUser(username, email, password, role = 'cashier') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role })
    });
  }

  // User management endpoints
  async getAllUsers() {
    return this.request('/users');
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId, data) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, { method: 'DELETE' });
  }

  // Product endpoints
  async getProducts(limit = 100, offset = 0) {
    return this.request(`/products?limit=${limit}&offset=${offset}`);
  }

  async getProductById(productId) {
    return this.request(`/products/${productId}`);
  }

  async getProductByBarcode(barcode) {
    return this.request(`/products/barcode/scan?barcode=${encodeURIComponent(barcode)}`);
  }

  async searchProducts(query) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}`);
  }

  async createProduct(data) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProduct(productId, data) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, { method: 'DELETE' });
  }

  async uploadProductImage(formData) {
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/products/upload-image`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/frontend/pages/login.html';
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Image upload failed');
    }

    return data;
  }

  async getLowStockProducts() {
    return this.request('/products/stock/low');
  }

  async getCategories() {
    return this.request('/products/categories/list/all');
  }

  // Customer endpoints
  async getCustomers(limit = 100, offset = 0) {
    return this.request(`/customers?limit=${limit}&offset=${offset}`);
  }

  async getCustomerById(customerId) {
    return this.request(`/customers/${customerId}`);
  }

  async getCustomerByPhone(phone) {
    return this.request(`/customers/phone/lookup?phone=${encodeURIComponent(phone)}`);
  }

  async searchCustomers(query) {
    return this.request(`/customers/search?q=${encodeURIComponent(query)}`);
  }

  async createCustomer(data) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCustomer(customerId, data) {
    return this.request(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Sales endpoints
  async createSale(data) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getSaleById(saleId) {
    return this.request(`/sales/${saleId}`);
  }

  async getAllSales(limit = 100, offset = 0) {
    return this.request(`/sales?limit=${limit}&offset=${offset}`);
  }

  async getSalesByDateRange(startDate, endDate) {
    return this.request(`/sales/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Report endpoints
  async getDailySalesReport(date) {
    return this.request(`/reports/daily/${date}`);
  }

  async getRevenueByDateRange(startDate, endDate) {
    return this.request(`/reports/revenue/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getTopProducts(startDate, endDate) {
    return this.request(`/reports/products/top?startDate=${startDate}&endDate=${endDate}`);
  }

  async getSalesSummary() {
    return this.request('/reports/summary');
  }

  async getPaymentMethodsSummary(startDate, endDate) {
    return this.request(`/reports/payments/methods?startDate=${startDate}&endDate=${endDate}`);
  }

  // Payment endpoints
  async initializePayment(data) {
    return this.request('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async verifyPayment(reference) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference })
    });
  }

  // Inventory endpoints
  async getLowStockProducts() {
    return this.request('/inventory/low-stock');
  }

  async adjustInventory(productId, quantityChange, notes) {
    return this.request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ productId, quantityChange, notes })
    });
  }
}

const api = new APIClient();

// UI Utility Functions
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.margin = '1rem';
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '1rem';
  alertDiv.style.right = '1rem';
  alertDiv.style.zIndex = '3000';
  alertDiv.style.maxWidth = '400px';

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.style.opacity = '0';
    alertDiv.style.transition = 'opacity 0.3s';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

function showLoading(button) {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = '...';
  button.disabled = true;
  button.dataset.originalText = originalText;
}

function hideLoading(button) {
  if (!button || !button.dataset.originalText) return;
  button.textContent = button.dataset.originalText;
  button.disabled = false;
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GHS'
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

// Get current user data from local storage
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Check if user has required role
function hasRole(requiredRoles) {
  const user = getCurrentUser();
  if (!user) return false;
  if (typeof requiredRoles === 'string') {
    return user.role === requiredRoles;
  }
  return requiredRoles.includes(user.role);
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/frontend/pages/login.html';
  }
}

// Redirect to login if not authorized
function requireRole(roles) {
  if (!isLoggedIn() || !hasRole(roles)) {
    window.location.href = '/frontend/pages/login.html';
  }
}
