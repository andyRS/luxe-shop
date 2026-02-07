import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'El código del cupón es requerido'],
      unique: true,
      uppercase: true,
      trim: true,
      maxLength: [20, 'El código no puede exceder 20 caracteres']
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      maxLength: [200, 'La descripción no puede exceder 200 caracteres']
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'El valor del descuento es requerido'],
      min: [0, 'El descuento no puede ser negativo']
    },
    minimumPurchase: {
      type: Number,
      default: 0,
      min: [0, 'El mínimo de compra no puede ser negativo']
    },
    maximumDiscount: {
      type: Number,
      default: null // null significa sin límite
    },
    usageLimit: {
      type: Number,
      default: null // null significa uso ilimitado
    },
    usedCount: {
      type: Number,
      default: 0
    },
    usagePerUser: {
      type: Number,
      default: 1 // Cuántas veces puede usar un mismo usuario
    },
    usedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }
    }],
    validFrom: {
      type: Date,
      required: true,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    applicableCategories: [{
      type: String
    }],
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    excludedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    firstPurchaseOnly: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Índices (code ya tiene unique: true que crea un índice automáticamente)
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });

// Método para verificar si el cupón es válido
couponSchema.methods.isValid = function(userId = null, cartTotal = 0) {
  const now = new Date();

  // Verificar si está activo
  if (!this.isActive) {
    return { valid: false, reason: 'El cupón no está activo' };
  }

  // Verificar fechas
  if (now < this.validFrom) {
    return { valid: false, reason: 'El cupón aún no está vigente' };
  }

  if (now > this.validUntil) {
    return { valid: false, reason: 'El cupón ha expirado' };
  }

  // Verificar límite de uso total
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'El cupón ha alcanzado su límite de uso' };
  }

  // Verificar mínimo de compra
  if (cartTotal < this.minimumPurchase) {
    return { 
      valid: false, 
      reason: `El mínimo de compra es $${this.minimumPurchase.toFixed(2)}` 
    };
  }

  // Verificar uso por usuario
  if (userId && this.usagePerUser) {
    const userUsage = this.usedBy.filter(u => u.user.toString() === userId.toString()).length;
    if (userUsage >= this.usagePerUser) {
      return { valid: false, reason: 'Ya has usado este cupón el máximo de veces permitido' };
    }
  }

  return { valid: true };
};

// Método para calcular el descuento
couponSchema.methods.calculateDiscount = function(subtotal) {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = subtotal * (this.discountValue / 100);
  } else {
    discount = this.discountValue;
  }

  // Aplicar límite máximo si existe
  if (this.maximumDiscount && discount > this.maximumDiscount) {
    discount = this.maximumDiscount;
  }

  // El descuento no puede ser mayor que el subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  return Math.round(discount * 100) / 100;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
