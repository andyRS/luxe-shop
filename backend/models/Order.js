import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderNumber: {
      type: String,
      unique: true
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
      image: String
    }],
    shippingAddress: {
      name: {
        type: String,
        required: true
      },
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      zipCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      }
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['stripe', 'paypal', 'cash']
    },
    paymentInfo: {
      id: String,
      status: String,
      update_time: Date
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      required: true,
      default: false
    },
    deliveredAt: Date,
    trackingNumber: String,
    notes: String
  },
  {
    timestamps: true
  }
);

// Generar número de orden único
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `LS-${Date.now()}-${count + 1}`;
  }
  next();
});

// Método para calcular el total
orderSchema.methods.calculateTotal = function() {
  this.itemsPrice = this.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  // Calcular impuestos (18% ITBIS en RD)
  this.taxPrice = this.itemsPrice * 0.18;
  
  // Envío gratis si supera $50
  this.shippingPrice = this.itemsPrice >= 50 ? 0 : 10;
  
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
