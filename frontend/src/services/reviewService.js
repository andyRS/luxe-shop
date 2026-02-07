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

// Obtener reseñas de un producto
export const getProductReviews = async (productId, page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}/reviews/product/${productId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Crear una reseña
export const createReview = async (reviewData) => {
  const response = await axios.post(`${API_URL}/reviews`, reviewData, getAuthConfig());
  return response.data;
};

// Actualizar una reseña
export const updateReview = async (reviewId, reviewData) => {
  const response = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData, getAuthConfig());
  return response.data;
};

// Eliminar una reseña
export const deleteReview = async (reviewId) => {
  const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, getAuthConfig());
  return response.data;
};

// Marcar reseña como útil
export const markReviewHelpful = async (reviewId) => {
  const response = await axios.post(`${API_URL}/reviews/${reviewId}/helpful`, {}, getAuthConfig());
  return response.data;
};

// Verificar si puede reseñar un producto
export const canReviewProduct = async (productId) => {
  const response = await axios.get(`${API_URL}/reviews/can-review/${productId}`, getAuthConfig());
  return response.data;
};

// Obtener mis reseñas
export const getMyReviews = async () => {
  const response = await axios.get(`${API_URL}/reviews/my-reviews`, getAuthConfig());
  return response.data;
};

export default {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  canReviewProduct,
  getMyReviews
};
