import api from './productService';

export const authService = {
  // Registrar usuario
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  // Obtener perfil del usuario
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  // Actualizar perfil
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
  
  // Cambiar contraseña
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Solicitar reset de contraseña
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Restablecer contraseña
  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Verificar email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },
};
