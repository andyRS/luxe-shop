import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    // Primero intentar obtener de localStorage directo
    let token = localStorage.getItem('token');
    
    // Si no está, intentar obtener del storage de Zustand
    if (!token) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        } catch (e) {
          console.error('Error parsing auth storage:', e);
        }
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar 401 (sesión expirada)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar auth storage y redirigir al login
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Servicios de productos
export const productService = {
  // Obtener todos los productos
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  // Obtener un producto por ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  // Crear producto (admin)
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  // Actualizar producto (admin)
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  // Eliminar producto (admin)
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  // Obtener productos por categoría
  getByCategory: async (category) => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },
  
  // Buscar productos
  search: async (query) => {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data;
  },
};

export default api;
