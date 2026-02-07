import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Validar un cupón
export const validateCoupon = async (code, cartTotal = 0) => {
  const response = await axios.post(`${API_URL}/coupons/validate`, { code, subtotal: cartTotal }, getAuthConfig());
  return response.data;
};

// Obtener cupones activos (públicos)
export const getActiveCoupons = async () => {
  const response = await axios.get(`${API_URL}/coupons/active`);
  return response.data;
};

// === ADMIN ENDPOINTS ===

// Crear cupón (admin)
export const createCoupon = async (couponData) => {
  const response = await axios.post(`${API_URL}/coupons`, couponData, getAuthConfig());
  return response.data;
};

// Obtener todos los cupones (admin)
export const getAllCoupons = async () => {
  const response = await axios.get(`${API_URL}/coupons`, getAuthConfig());
  return response.data;
};

// Obtener cupón por ID (admin)
export const getCouponById = async (couponId) => {
  const response = await axios.get(`${API_URL}/coupons/${couponId}`, getAuthConfig());
  return response.data;
};

// Actualizar cupón (admin)
export const updateCoupon = async (couponId, couponData) => {
  const response = await axios.put(`${API_URL}/coupons/${couponId}`, couponData, getAuthConfig());
  return response.data;
};

// Eliminar cupón (admin)
export const deleteCoupon = async (couponId) => {
  const response = await axios.delete(`${API_URL}/coupons/${couponId}`, getAuthConfig());
  return response.data;
};

export default {
  validateCoupon,
  getActiveCoupons,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
};
