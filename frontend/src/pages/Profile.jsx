import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Settings, ChevronRight, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { formatRD, formatUSD } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'República Dominicana'
    }
  });

  // Cargar órdenes cuando se activa el tab de pedidos
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await orderService.getMyOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      // Mostrar lista vacía si hay error de autenticación
      setOrders([]);
      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'shipped':
        return 'Enviado';
      case 'processing':
        return 'Procesando';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-display font-bold mb-8">Mi Cuenta</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User size={40} className="text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User size={20} />
                  Mi Perfil
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} />
                  Mis Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} />
                  Configuración
                </button>
              </nav>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            {/* Tab: Mi Perfil */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Información Personal</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-outline"
                    >
                      Editar Perfil
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Información Básica */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <User size={20} className="text-primary-500" />
                      Datos Personales
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Teléfono</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin size={20} className="text-primary-500" />
                      Dirección
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Calle y Número</label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Ciudad</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Provincia</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Código Postal</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">País</label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <button onClick={handleSave} className="btn-primary">
                        Guardar Cambios
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || '',
                            address: user?.address || {}
                          });
                        }}
                        className="btn-outline"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Mis Pedidos */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Mis Pedidos</h2>
                  <button 
                    onClick={fetchOrders}
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    disabled={loadingOrders}
                  >
                    <RefreshCw size={18} className={loadingOrders ? 'animate-spin' : ''} />
                    Actualizar
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No tienes pedidos aún</h3>
                    <p className="text-gray-600 mb-6">¡Explora nuestra tienda y realiza tu primera compra!</p>
                    <Link to="/productos" className="btn-primary">
                      Ver Productos
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all hover:border-primary-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('es-DO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className={`badge ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="text-sm text-gray-600">
                            {order.items?.length} {order.items?.length === 1 ? 'producto' : 'productos'}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary-600">
                                {formatRD(order.totalPrice)}
                              </p>
                              <p className="text-xs text-gray-400">{formatUSD(order.totalPrice)}</p>
                            </div>
                            <Link 
                              to={`/orden/${order._id}`}
                              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Ver Detalles
                              <ChevronRight size={18} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Configuración */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6">Configuración</h2>

                <div className="space-y-6">
                  <div className="pb-6 border-b">
                    <h3 className="font-semibold mb-4">Cambiar Contraseña</h3>
                    <div className="space-y-4 max-w-md">
                      <input type="password" placeholder="Contraseña actual" className="input-field" />
                      <input type="password" placeholder="Nueva contraseña" className="input-field" />
                      <input type="password" placeholder="Confirmar nueva contraseña" className="input-field" />
                      <button className="btn-primary">Actualizar Contraseña</button>
                    </div>
                  </div>

                  <div className="pb-6 border-b">
                    <h3 className="font-semibold mb-4">Notificaciones</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span>Notificaciones por email</span>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Ofertas y promociones</span>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Actualizaciones de pedidos</span>
                        <input type="checkbox" className="toggle" defaultChecked />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 text-red-600">Zona de Peligro</h3>
                    <button className="btn-outline border-red-500 text-red-500 hover:bg-red-50">
                      Eliminar Cuenta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
