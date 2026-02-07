import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as wishlistService from '../services/wishlistService';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      // Cargar wishlist desde el servidor
      fetchWishlist: async () => {
        set({ loading: true, error: null });
        try {
          const response = await wishlistService.getWishlist();
          set({ items: response.wishlist || [], loading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Error al cargar la lista de deseos',
            loading: false 
          });
        }
      },

      // Agregar producto a wishlist
      addItem: async (productId) => {
        set({ loading: true, error: null });
        try {
          const response = await wishlistService.addToWishlist(productId);
          set({ items: response.wishlist || [], loading: false });
          return { success: true };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Error al agregar a la lista de deseos',
            loading: false 
          });
          return { success: false, message: error.response?.data?.message };
        }
      },

      // Eliminar producto de wishlist
      removeItem: async (productId) => {
        set({ loading: true, error: null });
        try {
          const response = await wishlistService.removeFromWishlist(productId);
          set({ items: response.wishlist || [], loading: false });
          return { success: true };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Error al eliminar de la lista de deseos',
            loading: false 
          });
          return { success: false, message: error.response?.data?.message };
        }
      },

      // Toggle producto en wishlist
      toggleItem: async (productId) => {
        set({ loading: true, error: null });
        try {
          const response = await wishlistService.toggleWishlist(productId);
          set({ items: response.wishlist || [], loading: false });
          return { success: true, action: response.action };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Error al actualizar la lista de deseos',
            loading: false 
          });
          return { success: false, message: error.response?.data?.message };
        }
      },

      // Verificar si un producto está en wishlist (local)
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some(item => 
          (item._id || item) === productId
        );
      },

      // Limpiar wishlist (local)
      clearWishlist: () => {
        set({ items: [], error: null });
      },

      // Limpiar errores
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
);

export default useWishlistStore;
