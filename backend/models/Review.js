import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'La calificación es requerida'],
      min: [1, 'La calificación mínima es 1'],
      max: [5, 'La calificación máxima es 5']
    },
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
      maxLength: [100, 'El título no puede exceder 100 caracteres']
    },
    comment: {
      type: String,
      required: [true, 'El comentario es requerido'],
      trim: true,
      maxLength: [1000, 'El comentario no puede exceder 1000 caracteres']
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    helpfulVoters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    images: [{
      type: String
    }],
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto para evitar reseñas duplicadas del mismo usuario para el mismo producto
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Índice para búsquedas por producto
reviewSchema.index({ product: 1, createdAt: -1 });

// Método estático para calcular el rating promedio de un producto
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (result.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: Math.round(result[0].averageRating * 10) / 10,
        numReviews: result[0].numReviews
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error('Error actualizando rating del producto:', error);
  }
};

// Actualizar rating del producto después de guardar una reseña
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.product);
});

// Actualizar rating del producto después de eliminar una reseña
reviewSchema.post('deleteOne', { document: true, query: false }, function() {
  this.constructor.calculateAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
