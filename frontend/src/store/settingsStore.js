import { create } from 'zustand';
import axios from 'axios';
import { setExchangeRate } from '../utils/formatCurrency';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useSettingsStore = create((set, get) => ({
  settings: null,
  loading: false,
  loaded: false,

  fetchSettings: async () => {
    // Evitar múltiples llamadas simultáneas
    if (get().loading) return;
    
    try {
      set({ loading: true });
      const { data } = await axios.get(`${API_URL}/settings`);
      // Sincronizar tasa de cambio global
      if (data.exchangeRate) {
        setExchangeRate(data.exchangeRate);
      }
      set({ settings: data, loaded: true });
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Usar defaults si falla la API
      set({
        settings: {
          storeName: 'LuxeShop',
          storeDescription: 'Tu tienda de moda premium con las últimas tendencias y estilos únicos.',
          storeSlogan: 'Calidad garantizada y servicio excepcional.',
          contactPhone: '+1 (809) 555-1234',
          contactEmail: 'info@luxeshop.com',
          contactAddress: 'Santo Domingo, República Dominicana',
          contactAddressFull: 'Av. Abraham Lincoln #505, Santo Domingo',
          businessHours: 'Lun - Sáb: 9am - 7pm | Dom: 10am - 4pm',
          socialFacebook: '',
          socialInstagram: '',
          socialTwitter: '',
          whatsappNumber: '18095551234',
          whatsappMessage: '¡Hola! Necesito información sobre LuxeShop',
          whatsappEnabled: true,
          exchangeRate: 58.50,
          taxRate: 0.18,
          taxName: 'ITBIS',
          freeShippingThreshold: 50,
          flatShippingCost: 10,
          defaultCountry: 'República Dominicana',
          seoTitle: 'LuxeShop - Moda Premium',
          seoDescription: 'Descubre las últimas tendencias en moda premium.',
          developerName: 'Andy Rosado',
          developerUrl: 'https://andyrosado.dev',
        },
        loaded: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  // Helper para obtener un valor con fallback
  get: (key, fallback = '') => {
    const s = get().settings;
    return s?.[key] ?? fallback;
  },
}));

export default useSettingsStore;
