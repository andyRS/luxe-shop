import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Agregar producto al carrito
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(item => item._id === product._id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      
      // Remover producto del carrito
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item._id !== productId) });
      },
      
      // Actualizar cantidad
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item._id === productId ? { ...item, quantity } : item
          )
        });
      },
      
      // Incrementar cantidad
      incrementQuantity: (productId) => {
        set({
          items: get().items.map(item =>
            item._id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        });
      },
      
      // Decrementar cantidad
      decrementQuantity: (productId) => {
        const item = get().items.find(i => i._id === productId);
        if (item && item.quantity > 1) {
          set({
            items: get().items.map(i =>
              i._id === productId ? { ...i, quantity: i.quantity - 1 } : i
            )
          });
        } else {
          get().removeItem(productId);
        }
      },
      
      // Vaciar carrito
      clearCart: () => set({ items: [] }),
      
      // Obtener total
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      
      // Obtener cantidad total de items
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
