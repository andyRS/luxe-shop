import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, Truck, MapPin, CheckCircle, Clock, 
  ArrowLeft, Phone, Mail, Copy, RefreshCw,
  ChevronRight, AlertCircle, XCircle, FileText
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatUSD, formatRD } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(id);
      setOrder(data);
    } catch (error) {
      console.error('Error al cargar la orden:', error);
      toast.error('No se pudo cargar el pedido');
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
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/orders/${order._id}/invoice`, {
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

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { 
        label: 'Pendiente', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        description: 'Tu pedido ha sido recibido y está pendiente de procesamiento.'
      },
      processing: { 
        label: 'Procesando', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Package,
        description: 'Estamos preparando tu pedido para el envío.'
      },
      shipped: { 
        label: 'Enviado', 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Truck,
        description: 'Tu pedido está en camino. Pronto llegará a tu dirección.'
      },
      delivered: { 
        label: 'Entregado', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        description: '¡Tu pedido ha sido entregado exitosamente!'
      },
      cancelled: { 
        label: 'Cancelado', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        description: 'Este pedido ha sido cancelado.'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const getTimelineSteps = () => {
    const steps = [
      { 
        key: 'confirmed', 
        label: 'Pedido Confirmado', 
        icon: CheckCircle,
        date: order?.createdAt,
        description: 'Tu pedido ha sido recibido y confirmado'
      },
      { 
        key: 'processing', 
        label: 'En Preparación', 
        icon: Package,
        date: order?.status !== 'pending' ? order?.updatedAt : null,
        description: 'Estamos preparando tus productos'
      },
      { 
        key: 'shipped', 
        label: 'Enviado', 
        icon: Truck,
        date: order?.status === 'shipped' || order?.status === 'delivered' ? order?.updatedAt : null,
        description: order?.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'En camino a tu dirección'
      },
      { 
        key: 'delivered', 
        label: 'Entregado', 
        icon: MapPin,
        date: order?.deliveredAt,
        description: 'Pedido entregado exitosamente'
      }
    ];

    const statusIndex = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };

    const currentIndex = statusIndex[order?.status] ?? 0;

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex && order?.status !== 'cancelled',
      isCurrent: index === currentIndex && order?.status !== 'cancelled'
    }));
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
          <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pedido no encontrado</h2>
          <p className="text-gray-600 mb-6">No pudimos encontrar este pedido.</p>
          <Link to="/perfil" className="btn-primary">
            Ver Mis Pedidos
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/perfil" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a Mis Pedidos</span>
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText size={18} />
              Descargar Factura
            </button>
            <button 
              onClick={fetchOrder}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Número de Orden y Estado */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Pedido</p>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
                <button 
                  onClick={copyOrderNumber}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copiar"
                >
                  <Copy size={18} className="text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Realizado el {new Date(order.createdAt).toLocaleDateString('es-DO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                <StatusIcon size={18} />
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline de Seguimiento */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Truck className="text-primary-500" />
                Seguimiento del Pedido
              </h2>

              {order.status === 'cancelled' ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="text-red-500" size={24} />
                    <div>
                      <p className="font-semibold text-red-800">Pedido Cancelado</p>
                      <p className="text-sm text-red-600">Este pedido ha sido cancelado.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Línea vertical */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-6">
                    {timelineSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={step.key} className="relative flex gap-4">
                          {/* Icono del paso */}
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            step.isCompleted 
                              ? 'bg-primary-500 text-white' 
                              : 'bg-gray-100 text-gray-400'
                          } ${step.isCurrent ? 'ring-4 ring-primary-100' : ''}`}>
                            <StepIcon size={20} />
                          </div>
                          
                          {/* Contenido */}
                          <div className={`flex-1 pb-6 ${index === timelineSteps.length - 1 ? 'pb-0' : ''}`}>
                            <div className="flex items-center justify-between">
                              <h3 className={`font-semibold ${step.isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.label}
                              </h3>
                              {step.date && step.isCompleted && (
                                <span className="text-sm text-gray-500">
                                  {new Date(step.date).toLocaleDateString('es-DO', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${step.isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                              {step.description}
                            </p>
                            
                            {/* Tracking Number */}
                            {step.key === 'shipped' && order.trackingNumber && step.isCompleted && (
                              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg text-sm">
                                <span className="text-purple-700 font-medium">
                                  Tracking: {order.trackingNumber}
                                </span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.trackingNumber);
                                    toast.success('Número de tracking copiado');
                                  }}
                                  className="text-purple-500 hover:text-purple-700"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Productos */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Productos ({order.items?.length})</h2>
              
              <div className="divide-y">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-4">
                    <img 
                      src={item.image || '/images/placeholder.png'} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      <p className="text-sm text-gray-500">{formatRD(item.price)} c/u</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {formatRD(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-gray-400">{formatUSD(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            {/* Resumen de Pago */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Resumen</h3>
              
              <div className="space-y-3">
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
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <div className="text-right">
                    <span className="text-primary-600">{formatRD(order.totalPrice)}</span>
                    <p className="text-xs font-normal text-gray-400">{formatUSD(order.totalPrice)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={18} />
                  <span className="font-medium">Pago confirmado</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {order.paymentMethod === 'stripe' ? 'Tarjeta de crédito/débito' : order.paymentMethod}
                </p>
              </div>
            </div>

            {/* Dirección de Envío */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="text-primary-500" size={20} />
                Dirección de Envío
              </h3>
              
              <div className="text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.zipCode}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>

              {order.shippingAddress?.phone && (
                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-gray-600">
                  <Phone size={16} />
                  <span>{order.shippingAddress.phone}</span>
                </div>
              )}
            </div>

            {/* Notas */}
            {order.notes && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-3">Notas del Pedido</h3>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}

            {/* Ayuda */}
            <div className="bg-primary-50 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-3 text-primary-900">¿Necesitas ayuda?</h3>
              <p className="text-primary-700 text-sm mb-4">
                Si tienes alguna pregunta sobre tu pedido, contáctanos.
              </p>
              <a 
                href="https://wa.me/18095551234" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
              >
                <Phone size={18} />
                Contactar Soporte
                <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
