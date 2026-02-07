import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Crear nueva reseña
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el usuario ya dejó una reseña para este producto
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Ya has dejado una reseña para este producto' });
    }

    // Verificar si es una compra verificada
    const verifiedPurchase = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      isPaid: true
    });

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!verifiedPurchase
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ya has dejado una reseña para este producto' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtener reseñas de un producto
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1 };
        break;
      case 'helpful':
        sortOption = { helpful: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ 
      product: productId,
      isApproved: true 
    })
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skip)
      .populate('user', 'name avatar');

    const total = await Review.countDocuments({ 
      product: productId,
      isApproved: true 
    });

    // Calcular distribución de ratings
    const ratingDistribution = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId), isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    res.json({
      reviews,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      ratingDistribution: distribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar reseña
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Solo el autor puede editar su reseña
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado para editar esta reseña' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();
    const populatedReview = await Review.findById(updatedReview._id).populate('user', 'name avatar');

    res.json(populatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Eliminar reseña
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // El autor o admin puede eliminar
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para eliminar esta reseña' });
    }

    await review.deleteOne();

    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marcar reseña como útil
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar si el usuario ya votó
    const alreadyVoted = review.helpfulVoters.includes(req.user._id);

    if (alreadyVoted) {
      // Quitar voto
      review.helpfulVoters = review.helpfulVoters.filter(
        id => id.toString() !== req.user._id.toString()
      );
      review.helpful -= 1;
    } else {
      // Agregar voto
      review.helpfulVoters.push(req.user._id);
      review.helpful += 1;
    }

    await review.save();

    res.json({ 
      helpful: review.helpful,
      voted: !alreadyVoted 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verificar si el usuario puede dejar reseña
// @route   GET /api/reviews/can-review/:productId
// @access  Private
export const canReview = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar si ya dejó reseña
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      return res.json({ 
        canReview: false, 
        reason: 'already_reviewed',
        existingReview 
      });
    }

    // Verificar si compró el producto
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      isPaid: true
    });

    res.json({ 
      canReview: true,
      isVerifiedPurchase: !!hasPurchased 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener mis reseñas
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('product', 'name image images');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
