import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // === ESTADÍSTICAS PRINCIPALES ===
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalReviews,
      allOrders,
      monthOrders,
      lastMonthOrders,
      weekOrders,
      activeProducts,
      newUsersMonth,
      newUsersLastMonth,
      activeCoupons,
      lowStockProducts,
      recentOrders,
      topProducts,
      statusCounts,
      categoryCounts
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Review.countDocuments(),
      Order.find({}),
      Order.find({ createdAt: { $gte: startOfMonth } }),
      Order.find({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.find({ createdAt: { $gte: startOfWeek } }),
      Product.countDocuments({ isActive: true, stock: { $gt: 0 } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Coupon.countDocuments({ isActive: true, validUntil: { $gte: now } }),
      Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock price image category').limit(10),
      Order.find({}).sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
      // Top productos (por cantidad en órdenes)
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { 
          _id: '$items.product', 
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]),
      // Conteo por estado
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Conteo por categoría
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Calcular ventas totales
    const totalSales = allOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const monthSales = monthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const lastMonthSales = lastMonthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const weekSales = weekOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Calcular cambios porcentuales
    const salesChange = lastMonthSales > 0 
      ? (((monthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1)
      : monthSales > 0 ? '+100' : '0';

    const ordersChange = lastMonthOrders.length > 0
      ? (((monthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100).toFixed(1)
      : monthOrders.length > 0 ? '+100' : '0';

    const usersChange = newUsersLastMonth > 0
      ? (((newUsersMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1)
      : newUsersMonth > 0 ? '+100' : '0';

    // === VENTAS POR DÍA (últimos 30 días) ===
    const salesByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Mapear estados
    const statusMap = {};
    statusCounts.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      stats: {
        totalSales,
        monthSales,
        weekSales,
        salesChange: Number(salesChange),
        totalOrders,
        monthOrders: monthOrders.length,
        ordersChange: Number(ordersChange),
        totalProducts,
        activeProducts,
        totalUsers,
        newUsersMonth,
        usersChange: Number(usersChange),
        totalReviews,
        activeCoupons
      },
      ordersByStatus: {
        pending: statusMap.pending || 0,
        processing: statusMap.processing || 0,
        shipped: statusMap.shipped || 0,
        delivered: statusMap.delivered || 0,
        cancelled: statusMap.cancelled || 0
      },
      salesByDay,
      topProducts,
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        user: order.user,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      })),
      lowStockProducts,
      categoryCounts
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    // Count orders per user
    const userIds = users.map(u => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const orderMap = {};
    orderCounts.forEach(o => { orderMap[o._id.toString()] = o.count; });

    const usersWithOrders = users.map(u => ({
      ...u.toObject(),
      orders: orderMap[u._id.toString()] || 0
    }));

    res.json(usersWithOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    res.json({ message: `Rol actualizado a ${user.role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user active status (admin)
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private/Admin
export const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `Usuario ${user.isActive ? 'activado' : 'desactivado'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getDashboardStats, getUsers, updateUserRole, toggleUserActive, deleteUser };
