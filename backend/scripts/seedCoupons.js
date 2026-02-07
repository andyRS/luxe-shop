import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../models/Coupon.js';

dotenv.config();

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxeshop');
    console.log('✅ MongoDB conectado');

    // Eliminar cupones existentes
    await Coupon.deleteMany({});
    console.log('🗑️ Cupones anteriores eliminados');

    // Crear cupones de ejemplo
    const coupons = [
      {
        code: 'BIENVENIDO10',
        description: '10% de descuento para nuevos clientes',
        discountType: 'percentage',
        discountValue: 10,
        minimumPurchase: 20,
        usageLimit: 100,
        usagePerUser: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        isActive: true,
        firstPurchaseOnly: true
      },
      {
        code: 'ENVIOGRATIS',
        description: 'Envío gratis en tu compra',
        discountType: 'fixed',
        discountValue: 10,
        minimumPurchase: 30,
        usageLimit: 50,
        usagePerUser: 2,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        isActive: true
      },
      {
        code: 'LUXE20',
        description: '20% de descuento en toda la tienda',
        discountType: 'percentage',
        discountValue: 20,
        minimumPurchase: 50,
        maximumDiscount: 50, // Máximo $50 de descuento
        usageLimit: 30,
        usagePerUser: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        isActive: true
      },
      {
        code: 'VERANO2025',
        description: '$15 de descuento en verano',
        discountType: 'fixed',
        discountValue: 15,
        minimumPurchase: 40,
        usageLimit: null, // Sin límite
        usagePerUser: 3,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
        isActive: true
      }
    ];

    const createdCoupons = await Coupon.insertMany(coupons);
    console.log(`✅ ${createdCoupons.length} cupones creados:`);
    createdCoupons.forEach(c => {
      console.log(`   - ${c.code}: ${c.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedCoupons();
