import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, CreditCard, ArrowRight, Copy, Mail, Phone, FileText, Download } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatUSD, formatRD } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (!order && id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getById(id);
      setOrder(data);
    } catch (error) {
      console.error('Error al cargar la orden:', error);
      toast.error('No se pudo cargar los detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order?.orderNumber || '');
    toast.success('Número de orden copiado');
  };

  const handleDownloadInvoice = async () => {
    try {
      toast.loading('Generando factura...', { id: 'invoice' });
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${order._id}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al generar la factura');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Factura descargada', { id: 'invoice' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Error al descargar la factura', { id: 'invoice' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pedido no encontrado</h2>
          <p className="text-gray-600 mb-6">No pudimos encontrar los detalles de este pedido.</p>
          <Link to="/" className="btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container-custom max-w-4xl">
        {/* Header de Confirmación */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-xl text-gray-600">
            Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
          </p>
        </div>

        {/* Número de Orden */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Número de Orden</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary-600">{order.orderNumber}</span>
                <button 
                  onClick={copyOrderNumber}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copiar número de orden"
                >
                  <Copy size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500 mb-1">Total Pagado</p>
              <span className="text-2xl font-bold text-gray-900">{formatRD(order.totalPrice)}</span>
              <p className="text-sm text-gray-400">{formatUSD(order.totalPrice)}</p>
            </div>
          </div>
        </div>

        {/* Estado y Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Estado del Pedido</h2>
          
          <div className="flex items-center justify-between relative">
            {/* Línea de progreso */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: order.status === 'pending' ? '0%' : 
                                order.status === 'processing' ? '33%' :
                                order.status === 'shipped' ? '66%' : '100%' }}
              ></div>
            </div>

            {/* Pasos */}
            {[
              { key: 'pending', label: 'Confirmado', icon: CheckCircle },
              { key: 'processing', label: 'Procesando', icon: Package },
              { key: 'shipped', label: 'Enviado', icon: Truck },
              { key: 'delivered', label: 'Entregado', icon: MapPin }
            ].map((step, index) => {
              const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index;
              const isCurrent = order.status === step.key || (order.status === 'pending' && index === 0);
              
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}>
                    <step.icon size={20} />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${isCompleted ? 'text-primary-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-primary-50 rounded-xl">
            <p className="text-primary-800">
              <strong>Estado actual:</strong> Tu pedido ha sido confirmado y está siendo preparado. 
              Te notificaremos cuando sea enviado.
            </p>
          </div>
        </div>

        {/* Grid de Detalles */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Dirección de Envío */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-lg">Dirección de Envío</h3>
            </div>
            <div className="text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</p>
              <p className="flex items-center gap-2 mt-2">
                <Phone size={16} /> {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard size={20} className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg">Método de Pago</h3>
            </div>
            <div className="text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === 'stripe' ? 'Tarjeta de Crédito/Débito' :
                   order.paymentMethod === 'paypal' ? 'PayPal' : 'Efectivo'}
                </span>
              </p>
              <p className="text-green-600 font-medium flex items-center gap-2">
                <CheckCircle size={16} />
                Pago confirmado
              </p>
              <p className="text-sm text-gray-500">
                ID: {order.paymentInfo?.id}
              </p>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Productos ({order.items?.length})</h3>
          <div className="divide-y">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 py-4">
                <img 
                  src={item.image || '/images/placeholder.png'} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatRD(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-400">{formatUSD(item.price * item.quantity)}</p>
                  <p className="text-sm text-gray-500">{formatRD(item.price)} c/u</p>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen de Precios */}
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatRD(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ITBIS (18%)</span>
              <span>{formatRD(order.taxPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className={order.shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
                {order.shippingPrice === 0 ? 'GRATIS' : formatRD(order.shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <div className="text-right">
                <span className="text-primary-600">{formatRD(order.totalPrice)}</span>
                <p className="text-xs font-normal text-gray-400">{formatUSD(order.totalPrice)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email de Confirmación */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Mail size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Confirmación por Email</h3>
              <p className="text-blue-800">
                Hemos enviado los detalles de tu pedido a tu correo electrónico. 
                También recibirás actualizaciones cuando el estado de tu pedido cambie.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadInvoice}
            className="btn-primary inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <FileText size={20} />
            Descargar Factura
          </button>
          <Link 
            to={`/orden/${order._id}`}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            Rastrear Pedido
            <ArrowRight size={20} />
          </Link>
          <Link 
            to="/productos"
            className="btn-outline inline-flex items-center justify-center gap-2"
          >
            Seguir Comprando
          </Link>
          <Link 
            to="/perfil"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center justify-center gap-2"
          >
            Ver Mis Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
