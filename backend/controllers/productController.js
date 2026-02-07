import Product from '../models/Product.js';

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;

    let query = { isActive: true };

    // Filtrar por categoría
    if (category) {
      query.category = category;
    }

    // Filtrar por rango de precio
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Opciones de ordenamiento
    let sortOption = {};
    if (sort === 'price-asc') sortOption.price = 1;
    else if (sort === 'price-desc') sortOption.price = -1;
    else if (sort === 'name') sortOption.name = 1;
    else if (sort === 'rating') sortOption.rating = -1;
    else sortOption.createdAt = -1;

    // Paginación
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener producto por ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear nuevo producto
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Eliminar producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Soft delete - solo marcamos como inactivo
      product.isActive = false;
      await product.save();
      res.json({ message: 'Producto eliminado' });
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Buscar productos
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Se requiere un término de búsqueda' });
    }

    const products = await Product.searchProducts(q);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener productos por categoría
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
