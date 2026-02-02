import type { AuthProvider } from '@refinedev/core';
import api, { TOKEN_KEY } from '@/services/api';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const { data } = await api.post('/admin/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      return { success: true, redirectTo: '/' };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: 'Login Error',
          message: error.response?.data?.message || 'Invalid credentials',
        },
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/admin/logout');
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    return { success: true, redirectTo: '/login' };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { authenticated: false, redirectTo: '/login' };
    }
    try {
      await api.get('/admin/me');
      return { authenticated: true };
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      return { authenticated: false, redirectTo: '/login' };
    }
  },

  getIdentity: async () => {
    try {
      const { data } = await api.get('/admin/me');
      return { id: data.id, name: data.name, email: data.email, roles: data.roles, permissions: data.permissions };
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error?.statusCode === 401) {
      return { logout: true };
    }
    return { error };
  },

  getPermissions: async () => {
    try {
      const { data } = await api.get('/admin/me');
      return data.permissions;
    } catch {
      return [];
    }
  },
};
