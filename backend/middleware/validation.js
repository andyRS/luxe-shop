import { body, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Error de validación',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// Auth validations
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validate
];

// Product validations
export const productValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
  body('category').trim().notEmpty().withMessage('La categoría es requerida'),
  validate
];

// Order validations
export const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.product').notEmpty().withMessage('ID de producto requerido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser al menos 1'),
  body('shippingAddress.street').trim().notEmpty().withMessage('La dirección es requerida'),
  body('shippingAddress.city').trim().notEmpty().withMessage('La ciudad es requerida'),
  body('shippingAddress.state').trim().notEmpty().withMessage('La provincia es requerida'),
  body('paymentMethod').trim().notEmpty().withMessage('El método de pago es requerido'),
  validate
];

// Contact validations
export const contactValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('message').trim().notEmpty().withMessage('El mensaje es requerido').isLength({ max: 2000 }).withMessage('Máximo 2000 caracteres'),
  validate
];

// Newsletter validation
export const newsletterValidation = [
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  validate
];

// Review validations
export const reviewValidation = [
  body('product').notEmpty().withMessage('ID del producto requerido'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
  body('title').trim().notEmpty().withMessage('El título es requerido'),
  body('comment').trim().notEmpty().withMessage('El comentario es requerido'),
  validate
];

// Password reset validation
export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  validate
];

export const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate
];
