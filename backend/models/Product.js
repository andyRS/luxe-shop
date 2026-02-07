import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es requerido'],
      trim: true,
      maxLength: [200, 'El nombre no puede exceder 200 caracteres']
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      maxLength: [2000, 'La descripción no puede exceder 2000 caracteres']
    },
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'El descuento no puede ser negativo'],
      max: [100, 'El descuento no puede exceder 100%']
    },
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
      lowercase: true,
      enum: ['vestidos', 'pantalones', 'camisas', 'blusas', 'accesorios', 'zapatos', 'casual', 'formal', 'deportivo', 'conjuntos', 'faldas']
    },
    subcategory: {
      type: String,
      trim: true
    },
    images: [{
      type: String
    }],
    image: {
      type: String,
      default: '/placeholder.jpg'
    },
    stock: {
      type: Number,
      required: [true, 'El stock es requerido'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0
    },
    sizes: [{
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    }],
    colors: [{
      type: String
    }],
    brand: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'La calificación mínima es 0'],
      max: [5, 'La calificación máxima es 5']
    },
    reviews: {
      type: Number,
      default: 0
    },
    isNewArrival: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tags: [{
      type: String
    }],
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    weight: {
      type: Number,
      default: 0
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices para mejorar las búsquedas
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual para precio con descuento
productSchema.virtual('finalPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Método para verificar disponibilidad
productSchema.methods.isInStock = function() {
  return this.stock > 0 && this.isActive;
};

// Método estático para buscar productos
productSchema.statics.searchProducts = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  });
};

const Product = mongoose.model('Product', productSchema);

export default Product;
