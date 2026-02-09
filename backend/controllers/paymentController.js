import Stripe from 'stripe';
import Order from '../models/Order.js';

// Inicializar Stripe solo si la clave está configurada
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_YOUR_SECRET_KEY_HERE') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('💳 Stripe configurado correctamente');
} else {
  console.log('⚠️ Stripe no configurado - modo demo activado');
}

// @desc    Crear PaymentIntent de Stripe
// @route   POST /api/orders/create-payment-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      // Modo demo: simular payment intent
      return res.json({
        clientSecret: `demo_secret_${Date.now()}`,
        paymentIntentId: `demo_pi_${Date.now()}`,
        demo: true
      });
    }

    const { amount, orderId } = req.body;

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'usd',
      metadata: {
        orderId: orderId || '',
        userId: req.user._id.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error al procesar el pago', error: error.message });
  }
};

// @desc    Confirmar pago y actualizar orden
// @route   POST /api/orders/confirm-payment
// @access  Private
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Modo demo: confirmar directamente
    if (!stripe || paymentIntentId?.startsWith('demo_')) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentInfo = {
          id: paymentIntentId || `demo_${Date.now()}`,
          status: 'completed',
          update_time: new Date()
        };
        await order.save();
        return res.json({ success: true, message: 'Pago confirmado (demo)', order });
      }
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Verificar el estado del pago en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Actualizar la orden como pagada
      const order = await Order.findById(orderId);
      
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentInfo = {
          id: paymentIntentId,
          status: 'completed',
          update_time: new Date()
        };
        await order.save();

        res.json({ 
          success: true, 
          message: 'Pago confirmado exitosamente',
          order 
        });
      } else {
        res.status(404).json({ message: 'Orden no encontrada' });
      }
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'El pago no fue completado',
        status: paymentIntent.status 
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error al confirmar el pago', error: error.message });
  }
};

// @desc    Obtener configuración de Stripe (publishable key)
// @route   GET /api/orders/stripe-config
// @access  Public
export const getStripeConfig = async (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    demoMode: !stripe
  });
};

// @desc    Webhook de Stripe
// @route   POST /api/orders/webhook
// @access  Public (Stripe)
export const stripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(400).json({ message: 'Stripe no configurado' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar eventos de Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      
      // Actualizar orden si hay orderId en metadata
      if (paymentIntent.metadata.orderId) {
        try {
          const order = await Order.findById(paymentIntent.metadata.orderId);
          if (order && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentInfo = {
              id: paymentIntent.id,
              status: 'completed',
              update_time: new Date()
            };
            await order.save();
            console.log('Order updated via webhook:', order.orderNumber);
          }
        } catch (error) {
          console.error('Error updating order via webhook:', error);
        }
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
