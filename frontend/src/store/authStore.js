import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Login
      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true
        });
      },
      
      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      // Actualizar usuario
      updateUser: (userData) => {
        set({ user: userData });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
