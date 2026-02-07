import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

// @desc    Validar cupón
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    // Verificar si es solo para primera compra
    if (coupon.firstPurchaseOnly) {
      const hasOrders = await Order.findOne({ user: req.user._id, isPaid: true });
      if (hasOrders) {
        return res.status(400).json({ message: 'Este cupón es solo para tu primera compra' });
      }
    }

    // Verificar validez
    const validation = coupon.isValid(req.user._id, subtotal);
    
    if (!validation.valid) {
      return res.status(400).json({ message: validation.reason });
    }

    // Calcular descuento
    const discount = coupon.calculateDiscount(subtotal);

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumPurchase: coupon.minimumPurchase
      },
      discount,
      newSubtotal: subtotal - discount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Aplicar cupón a orden (interno)
// @route   Usado internamente al crear orden
export const applyCouponToOrder = async (couponCode, userId, orderId, subtotal) => {
  try {
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true 
    });

    if (!coupon) return null;

    const validation = coupon.isValid(userId, subtotal);
    if (!validation.valid) return null;

    // Registrar uso
    coupon.usedCount += 1;
    coupon.usedBy.push({
      user: userId,
      orderId: orderId,
      usedAt: new Date()
    });

    await coupon.save();

    return coupon.calculateDiscount(subtotal);
  } catch (error) {
    console.error('Error aplicando cupón:', error);
    return null;
  }
};

// @desc    Crear cupón (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumPurchase,
      maximumDiscount,
      usageLimit,
      usagePerUser,
      validFrom,
      validUntil,
      applicableCategories,
      firstPurchaseOnly
    } = req.body;

    // Verificar si el código ya existe
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Ya existe un cupón con ese código' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minimumPurchase: minimumPurchase || 0,
      maximumDiscount: maximumDiscount || null,
      usageLimit: usageLimit || null,
      usagePerUser: usagePerUser || 1,
      validFrom: validFrom || new Date(),
      validUntil,
      applicableCategories: applicableCategories || [],
      firstPurchaseOnly: firstPurchaseOnly || false
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtener todos los cupones (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener cupón por ID (Admin)
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar cupón (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    const updatedFields = [
      'description', 'discountType', 'discountValue', 'minimumPurchase',
      'maximumDiscount', 'usageLimit', 'usagePerUser', 'validFrom',
      'validUntil', 'isActive', 'applicableCategories', 'firstPurchaseOnly'
    ];

    updatedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        coupon[field] = req.body[field];
      }
    });

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Eliminar cupón (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    await coupon.deleteOne();
    res.json({ message: 'Cupón eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener cupones activos (públicos)
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    })
    .select('code description discountType discountValue minimumPurchase validUntil')
    .sort({ discountValue: -1 })
    .limit(5);

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
