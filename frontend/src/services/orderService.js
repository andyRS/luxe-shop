import api from './productService';

export const orderService = {
  // Crear orden
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  // Obtener mis órdenes
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },
  
  // Obtener orden por ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  // Obtener todas las órdenes (admin)
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  
  // Actualizar estado de orden (admin)
  updateStatus: async (id, status, trackingNumber = null) => {
    const data = { status };
    if (trackingNumber) {
      data.trackingNumber = trackingNumber;
    }
    const response = await api.put(`/orders/${id}/status`, data);
    return response.data;
  },
  
  // Obtener configuración de Stripe
  getStripeConfig: async () => {
    const response = await api.get('/orders/stripe-config');
    return response.data;
  },
  
  // Crear PaymentIntent de Stripe
  createPaymentIntent: async (amount, orderId = null) => {
    const response = await api.post('/orders/create-payment-intent', { amount, orderId });
    return response.data;
  },
  
  // Confirmar pago
  confirmPayment: async (paymentIntentId, orderId) => {
    const response = await api.post('/orders/confirm-payment', { paymentIntentId, orderId });
    return response.data;
  }
};
