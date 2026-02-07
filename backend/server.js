import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import generalRoutes from './routes/generalRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { getSettings } from './controllers/settingsController.js';
import { stripeWebhook } from './controllers/paymentController.js';
import configurePassport from './config/passport.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Seguridad - Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate Limiting para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máx 20 intentos por IP
  message: { message: 'Demasiados intentos. Por favor espera 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Webhook de Stripe (necesita raw body, antes del json parser)
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Passport
configurePassport();
app.use(passport.initialize());

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxeshop');
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Rutas
app.get('/', (req, res) => {
  res.json({ 
    message: 'LuxeShop API v1.0',
    status: 'running',
    endpoints: {
      products: '/api/products',
      auth: '/api/auth',
      orders: '/api/orders',
      health: '/health'
    }
  });
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', generalRoutes);
app.use('/api', uploadRoutes);

// Ruta pública de configuración
app.get('/api/settings', getSettings);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    });
  });
});

export default app;
