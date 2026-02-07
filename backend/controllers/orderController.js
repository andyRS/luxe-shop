import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../utils/emailService.js';
import { generateInvoicePDF } from '../utils/pdfService.js';

// @desc    Crear nueva orden
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentInfo,
      notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No hay items en la orden' });
    }

    // Validar que todos los items tengan product ID válido
    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({ 
          message: `Item "${item.name}" no tiene ID de producto válido` 
        });
      }
      // Verificar si es un ObjectId válido de MongoDB
      if (!item.product.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          message: `El producto "${item.name}" tiene un ID inválido: ${item.product}. Debe ser un producto de la base de datos.` 
        });
      }
    }

    // Crear orden
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      paymentInfo,
      notes,
      isPaid: true,
      paidAt: new Date()
    });

    // Calcular totales
    order.calculateTotal();

    // Guardar orden
    const createdOrder = await order.save();

    // Actualizar stock de productos
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Enviar email de confirmación
    const user = await User.findById(req.user._id);
    if (user?.email) {
      sendOrderConfirmationEmail(createdOrder, user.email);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Obtener mis órdenes
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener orden por ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    if (order) {
      // Verificar que la orden pertenece al usuario o es admin
      if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.json(order);
      } else {
        res.status(403).json({ message: 'No autorizado para ver esta orden' });
      }
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener todas las órdenes
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar estado de orden
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'email');

    if (order) {
      const previousStatus = order.status;
      order.status = status;

      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }

      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();

      // Enviar email de actualización si el estado cambió
      if (previousStatus !== status && order.user?.email) {
        sendOrderStatusUpdateEmail(updatedOrder, order.user.email, status);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Descargar factura PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Verificar que la orden pertenece al usuario o es admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para descargar esta factura' });
    }

    // Generar y enviar el PDF
    generateInvoicePDF(order, res);
  } catch (error) {
    console.error('Error generando factura:', error);
    res.status(500).json({ message: 'Error al generar la factura' });
  }
};

// @desc    Descargar factura PDF con datos editados (Admin)
// @route   POST /api/orders/:id/invoice/custom
// @access  Private/Admin
export const downloadCustomInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Construir objeto modificado con los overrides del admin
    const overrides = req.body;
    const customOrder = order.toObject();

    // Aplicar overrides del cliente
    if (overrides.customerName) {
      customOrder.shippingAddress = { ...customOrder.shippingAddress, name: overrides.customerName };
    }
    if (overrides.customerPhone) {
      customOrder.shippingAddress = { ...customOrder.shippingAddress, phone: overrides.customerPhone };
    }
    if (overrides.customerAddress) {
      customOrder.shippingAddress = { ...customOrder.shippingAddress, street: overrides.customerAddress };
    }
    if (overrides.customerCity) {
      customOrder.shippingAddress = { ...customOrder.shippingAddress, city: overrides.customerCity };
    }
    if (overrides.customerState) {
      customOrder.shippingAddress = { ...customOrder.shippingAddress, state: overrides.customerState };
    }

    // Aplicar overrides de items
    if (overrides.items && Array.isArray(overrides.items)) {
      customOrder.items = overrides.items;
    }

    // Aplicar overrides de montos
    if (overrides.itemsPrice !== undefined) customOrder.itemsPrice = Number(overrides.itemsPrice);
    if (overrides.taxPrice !== undefined) customOrder.taxPrice = Number(overrides.taxPrice);
    if (overrides.shippingPrice !== undefined) customOrder.shippingPrice = Number(overrides.shippingPrice);
    if (overrides.totalPrice !== undefined) customOrder.totalPrice = Number(overrides.totalPrice);
    if (overrides.notes) customOrder.notes = overrides.notes;

    generateInvoicePDF(customOrder, res);
  } catch (error) {
    console.error('Error generando factura personalizada:', error);
    res.status(500).json({ message: 'Error al generar la factura' });
  }
};
