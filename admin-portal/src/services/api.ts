import axios from 'axios';

const TOKEN_KEY = 'providr_admin_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/admin-portal/login';
      }
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;
