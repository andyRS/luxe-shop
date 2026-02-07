import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Obtener lista de deseos
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        select: 'name price images image discount rating numReviews stock isActive'
      });

    // Filtrar productos que ya no existen o están inactivos
    const activeWishlist = user.wishlist.filter(product => product && product.isActive);

    res.json(activeWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Agregar producto a lista de deseos
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const user = await User.findById(req.user._id);

    // Verificar si ya está en la lista
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'El producto ya está en tu lista de deseos' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ 
      message: 'Producto agregado a la lista de deseos',
      wishlist: user.wishlist 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar producto de lista de deseos
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    // Verificar si está en la lista
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'El producto no está en tu lista de deseos' });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({ 
      message: 'Producto eliminado de la lista de deseos',
      wishlist: user.wishlist 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle producto en lista de deseos
// @route   PUT /api/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const user = await User.findById(req.user._id);
    const isInWishlist = user.wishlist.includes(productId);

    if (isInWishlist) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    res.json({ 
      inWishlist: !isInWishlist,
      wishlist: user.wishlist 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verificar si producto está en lista de deseos
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    res.json({ 
      inWishlist: user.wishlist.includes(productId) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
