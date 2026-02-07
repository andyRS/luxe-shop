import api from './productService';

// Obtener wishlist del usuario
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

// Agregar producto a wishlist
export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

// Eliminar producto de wishlist
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

// Toggle producto en wishlist (agregar/quitar)
export const toggleWishlist = async (productId) => {
  const response = await api.put(`/wishlist/${productId}`);
  return response.data;
};

// Verificar si un producto está en wishlist
export const checkInWishlist = async (productId) => {
  const response = await api.get(`/wishlist/check/${productId}`);
  return response.data;
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkInWishlist
};
