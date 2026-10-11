// STUDENT360 — API Client & Toast Notification Module
const API = {
  baseUrl: (typeof window !== 'undefined' && (window.location.port === '8080' || window.location.protocol === 'file:')) 
    ? '/api' 
    : 'http://localhost:8080/api',

  async request(path, options = {}) {
    const isLocalSamePort = typeof window !== 'undefined' && (window.location.port === '8080' || window.location.protocol === 'file:');
    const config = {
      credentials: isLocalSamePort ? 'same-origin' : 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(this.baseUrl + path, config);

      if (response.status === 204) {
        return null;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(data && data.message ? data.message : `HTTP ${response.status}: Request failed`);
        error.status = response.status;
        error.errors = data && data.errors ? data.errors : null;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/me')) {
        API.toast('Session expired. Please log in again.', 'warning');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1200);
      }
      throw err;
    }
  },

  get(path) {
    return this.request(path, { method: 'GET' });
  },

  post(path, body) {
    return this.request(path, { method: 'POST', body });
  },

  put(path, body) {
    return this.request(path, { method: 'PUT', body });
  },

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  },

  toast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} glass`;
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    toast.innerHTML = `<span style="font-weight:bold; font-size:1.1rem">${icons[type] || 'ℹ'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};
