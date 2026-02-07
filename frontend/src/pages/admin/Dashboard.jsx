import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, Package, Users, DollarSign, ShoppingBag, Settings, LayoutDashboard,
  TrendingUp, TrendingDown, AlertTriangle, Star, Tag, ArrowUpRight, 
  Clock, CheckCircle, Truck, XCircle, RefreshCw
} from 'lucide-react';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import UserManagement from './UserManagement';
import SettingsManagement from './SettingsManagement';
import axios from 'axios';
import { formatRD, formatUSD, formatCompact } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Productos', icon: Package },
    { path: '/admin/orders', label: 'Órdenes', icon: ShoppingBag },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
    { path: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-screen sticky top-0">
          <div className="p-6 border-b">
            <h2 className="text-xl font-display font-bold text-gradient">Admin Panel</h2>
            <p className="text-sm text-gray-600 mt-1">LuxeShop</p>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={<SettingsManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => formatRD(n);
  const fmtUsd = (n) => formatUSD(n);
  const fmtN = (n) => new Intl.NumberFormat('es-DO').format(n || 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">No se pudieron cargar las estadísticas</p>
        <button onClick={fetchStats} className="btn-primary">Reintentar</button>
      </div>
    );
  }

  const { stats, ordersByStatus, salesByDay, topProducts, recentOrders, lowStockProducts, categoryCounts } = data;
  const maxSales = salesByDay.length > 0 ? Math.max(...salesByDay.map(d => d.sales)) : 1;

  const mainStats = [
    { title: 'Ventas Totales', value: fmt(stats.totalSales), subtitle: `${fmt(stats.monthSales)} este mes`, icon: DollarSign, color: 'bg-gradient-to-br from-green-500 to-emerald-600', change: stats.salesChange },
    { title: 'Órdenes', value: fmtN(stats.totalOrders), subtitle: `${stats.monthOrders} este mes`, icon: ShoppingBag, color: 'bg-gradient-to-br from-orange-500 to-amber-600', change: stats.ordersChange },
    { title: 'Productos', value: fmtN(stats.totalProducts), subtitle: `${stats.activeProducts} con stock`, icon: Package, color: 'bg-gradient-to-br from-blue-500 to-indigo-600', change: null },
    { title: 'Usuarios', value: fmtN(stats.totalUsers), subtitle: `${stats.newUsersMonth} nuevos este mes`, icon: Users, color: 'bg-gradient-to-br from-purple-500 to-violet-600', change: stats.usersChange },
  ];

  const statusLabels = { pending: 'Pendiente', processing: 'Procesando', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };
  const statusColors = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard General</h1>
          <p className="text-gray-500 mt-1">Resumen de tu tienda en tiempo real</p>
        </div>
        <button onClick={fetchStats} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              {stat.change !== null && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Order Status Bars */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { key: 'pending', icon: Clock, color: 'border-yellow-400', textColor: 'text-yellow-600' },
          { key: 'processing', icon: Package, color: 'border-blue-400', textColor: 'text-blue-600' },
          { key: 'shipped', icon: Truck, color: 'border-purple-400', textColor: 'text-purple-600' },
          { key: 'delivered', icon: CheckCircle, color: 'border-green-400', textColor: 'text-green-600' },
          { key: 'cancelled', icon: XCircle, color: 'border-red-400', textColor: 'text-red-600' },
        ].map(({ key, icon: Icon, color, textColor }) => (
          <div key={key} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
            <div className={`flex items-center gap-2 ${textColor} mb-1`}>
              <Icon size={16} />
              <span className="text-sm font-medium">{statusLabels[key]}</span>
            </div>
            <p className="text-2xl font-bold">{ordersByStatus[key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Chart + Top Products */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BarChart3 className="text-primary-500" size={20} /> Ventas Últimos 30 Días
            </h3>
            <span className="text-sm text-gray-500">{fmt(stats.monthSales)} este mes</span>
          </div>
          {salesByDay.length > 0 ? (
            <div className="flex items-end gap-1 h-48">
              {salesByDay.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div className="w-full bg-gradient-to-t from-primary-500 to-orange-400 rounded-t-sm hover:from-primary-600 hover:to-orange-500 transition-colors cursor-pointer min-h-[4px]" style={{ height: `${Math.max((day.sales / maxSales) * 100, 3)}%` }}></div>
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-1.5 px-3 whitespace-nowrap shadow-lg">
                      <p className="font-medium">{new Date(day._id).toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })}</p>
                      <p>{fmt(day.sales)} · {day.orders} orden{day.orders !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">Sin datos de ventas recientes</div>
          )}
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Hace 30 días</span>
            <span>Hoy</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="text-amber-500" size={20} /> Top Productos
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.totalSold} vendidos</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{fmt(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">Sin datos aún</p>}
        </div>
      </div>

      {/* Recent Orders + Side panels */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShoppingBag className="text-primary-500" size={20} /> Órdenes Recientes
            </h3>
            <Link to="/admin/orders" className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
              Ver todas <ArrowUpRight size={14} />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b text-left">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Orden</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                </tr></thead>
                <tbody className="divide-y">
                  {recentOrders.slice(0, 7).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="py-3"><span className="text-sm font-semibold text-primary-600">{order.orderNumber}</span></td>
                      <td className="py-3 text-sm text-gray-700">{order.user?.name || 'N/A'}</td>
                      <td className="py-3 text-sm font-bold text-gray-900">{fmt(order.totalPrice)}</td>
                      <td className="py-3"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span></td>
                      <td className="py-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">No hay órdenes aún</p>}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500" size={20} /> Stock Bajo</h3>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{p.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                    </span>
                  </div>
                ))}
              </div>
            ) : <p className="text-green-600 text-sm flex items-center gap-2"><CheckCircle size={16} /> Todo el stock está bien</p>}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Tag className="text-primary-500" size={20} /> Por Categoría</h3>
            {categoryCounts.length > 0 ? (
              <div className="space-y-3">
                {categoryCounts.map((cat) => {
                  const total = categoryCounts.reduce((s, c) => s + c.count, 0);
                  const pct = total > 0 ? ((cat.count / total) * 100).toFixed(0) : 0;
                  return (
                    <div key={cat._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium text-gray-700">{cat._id}</span>
                        <span className="text-gray-500">{cat.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary-500 to-orange-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-400 text-sm">Sin datos</p>}
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-orange-500 rounded-xl shadow-md p-6 text-white">
            <h3 className="font-bold text-lg mb-3">Resumen Rápido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="opacity-90">Reseñas</span><span className="font-bold">{stats.totalReviews}</span></div>
              <div className="flex justify-between"><span className="opacity-90">Cupones activos</span><span className="font-bold">{stats.activeCoupons}</span></div>
              <div className="flex justify-between"><span className="opacity-90">Ventas semana</span><span className="font-bold">{fmt(stats.weekSales)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-lg mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/admin/products', icon: Package, label: 'Gestionar Productos' },
            { to: '/admin/orders', icon: ShoppingBag, label: 'Ver Órdenes' },
            { to: '/admin/users', icon: Users, label: 'Gestionar Usuarios' },
            { to: '/admin/settings', icon: Settings, label: 'Configuración' },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors text-center group">
              <Icon size={32} className="mx-auto mb-2 text-primary-500 group-hover:scale-110 transition-transform" />
              <p className="font-medium">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
