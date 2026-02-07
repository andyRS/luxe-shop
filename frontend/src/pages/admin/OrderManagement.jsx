import { useState, useEffect } from 'react';
import { Search, Eye, Truck, CheckCircle, XCircle, Package, Send, FileText, Download, Edit3, X, Loader2 } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatRD, formatUSD } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(null); // order for invoice editing

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const map = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };
    return map[status] || map.pending;
  };

  const handleStatusChange = async (orderId, newStatus, orderTrackingNumber = null) => {
    try {
      setUpdatingStatus(true);
      await orderService.updateStatus(orderId, newStatus, orderTrackingNumber);
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus, trackingNumber: orderTrackingNumber || o.trackingNumber } : o));
      toast.success('Estado actualizado');
      setTrackingNumber('');
    } catch (error) {
      toast.error('Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShipOrder = (orderId) => {
    if (!trackingNumber.trim()) { toast.error('Ingresa un número de rastreo'); return; }
    handleStatusChange(orderId, 'shipped', trackingNumber.trim());
  };

  // Descargar factura directa (sin editar)
  const handleDownloadInvoice = async (order) => {
    try {
      toast.loading('Generando factura...', { id: 'inv' });
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${order._id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Factura descargada', { id: 'inv' });
    } catch {
      toast.error('Error al descargar', { id: 'inv' });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold mb-8">Gestión de Órdenes</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar por número de orden, cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-3">{filteredOrders.length} órdenes encontradas</p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Orden</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const si = getStatusInfo(order.status);
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><p className="font-semibold text-gray-900">{order.orderNumber}</p></td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{order.user?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.user?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4"><p className="font-bold text-primary-500">{formatRD(order.totalPrice)}</p><p className="text-xs text-gray-400">{formatUSD(order.totalPrice)}</p></td>
                      <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${si.color}`}>{si.label}</span></td>
                      <td className="px-6 py-4"><p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('es-DO')}</p></td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 items-center flex-wrap">
                          <button onClick={() => setSelectedOrder(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles"><Eye size={18} /></button>
                          <button onClick={() => handleDownloadInvoice(order)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Descargar factura"><Download size={18} /></button>
                          <button onClick={() => setInvoiceModal(order)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Editar y descargar factura"><Edit3 size={18} /></button>
                          {order.status === 'processing' ? (
                            <div className="flex items-center gap-1">
                              <input type="text" placeholder="# Rastreo" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                                className="text-sm w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500" />
                              <button onClick={() => handleShipOrder(order._id)} disabled={updatingStatus}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors disabled:opacity-50">
                                <Send size={12} /> Enviar
                              </button>
                            </div>
                          ) : (
                            <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} disabled={updatingStatus}
                              className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
                              <option value="pending">Pendiente</option>
                              <option value="processing">Procesando</option>
                              <option value="shipped">Enviado</option>
                              <option value="delivered">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-gray-500">No se encontraron órdenes</div>
          )}
        </div>
      )}

      {/* Modal Detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Detalles de la Orden</h2>
                <p className="text-gray-600">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Cliente</h3>
                <p className="text-gray-700">{selectedOrder.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{selectedOrder.user?.email || ''}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dirección de Envío</h3>
                <p className="text-gray-700">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.phone}</p>
              </div>
              {selectedOrder.trackingNumber && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-1 flex items-center gap-2"><Truck size={18} className="text-blue-600" /> Rastreo</h3>
                  <p className="text-blue-700 font-mono text-lg">{selectedOrder.trackingNumber}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Productos</h3>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b">
                    <div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-600">Cant: {item.quantity}</p></div>
                    <p className="font-bold text-primary-500">{formatRD(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1 pt-4 border-t">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatRD(selectedOrder.itemsPrice)}</span></div>
                <div className="flex justify-between text-sm"><span>ITBIS</span><span>{formatRD(selectedOrder.taxPrice)}</span></div>
                <div className="flex justify-between text-sm"><span>Envío</span><span>{selectedOrder.shippingPrice === 0 ? 'GRATIS' : formatRD(selectedOrder.shippingPrice)}</span></div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t"><span>Total</span><div className="text-right"><span className="text-primary-500">{formatRD(selectedOrder.totalPrice)}</span><p className="text-xs font-normal text-gray-400">{formatUSD(selectedOrder.totalPrice)}</p></div></div>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button onClick={() => handleDownloadInvoice(selectedOrder)} className="flex-1 btn-primary flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
                <Download size={18} /> Descargar Factura
              </button>
              <button onClick={() => { setInvoiceModal(selectedOrder); setSelectedOrder(null); }} className="flex-1 btn-outline flex items-center justify-center gap-2">
                <Edit3 size={18} /> Editar Factura
              </button>
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Factura */}
      {invoiceModal && <InvoiceEditModal order={invoiceModal} onClose={() => setInvoiceModal(null)} />}
    </div>
  );
};

// ===== INVOICE EDIT MODAL =====
const InvoiceEditModal = ({ order, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: order.shippingAddress?.name || '',
    customerPhone: order.shippingAddress?.phone || '',
    customerAddress: order.shippingAddress?.street || '',
    customerCity: order.shippingAddress?.city || '',
    customerState: order.shippingAddress?.state || '',
    items: (order.items || []).map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      product: item.product?._id || item.product
    })),
    itemsPrice: order.itemsPrice || 0,
    taxPrice: order.taxPrice || 0,
    shippingPrice: order.shippingPrice || 0,
    totalPrice: order.totalPrice || 0
  });
  const [downloading, setDownloading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: field === 'name' ? value : Number(value) };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const recalculate = () => {
    const itemsPrice = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxPrice = +(itemsPrice * 0.18).toFixed(2);
    const shippingPrice = itemsPrice >= 50 ? 0 : 10;
    const totalPrice = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);
    setFormData(prev => ({ ...prev, itemsPrice, taxPrice, shippingPrice, totalPrice }));
  };

  const handleDownloadCustom = async () => {
    try {
      setDownloading(true);
      toast.loading('Generando factura editada...', { id: 'cinv' });
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${order._id}/invoice/custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Error');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-editada-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Factura descargada', { id: 'cinv' });
      onClose();
    } catch {
      toast.error('Error al generar factura', { id: 'cinv' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="text-purple-600" size={24} /> Editar Factura</h2>
            <p className="text-sm text-gray-500">Orden: {order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Datos del cliente */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Datos del Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={formData.customerName} onChange={(e) => handleChange('customerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={formData.customerPhone} onChange={(e) => handleChange('customerPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input type="text" value={formData.customerAddress} onChange={(e) => handleChange('customerAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input type="text" value={formData.customerCity} onChange={(e) => handleChange('customerCity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <input type="text" value={formData.customerState} onChange={(e) => handleChange('customerState', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Productos
            </h3>
            <div className="space-y-3">
              {formData.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Producto</label>
                    <input type="text" value={item.name} onChange={(e) => handleItemChange(i, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(i, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
                    <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(i, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-bold text-primary-600">{formatRD(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-400">{formatUSD(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={recalculate} className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              ↻ Recalcular totales
            </button>
          </div>

          {/* Montos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Montos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <input type="number" step="0.01" value={formData.itemsPrice} onChange={(e) => handleChange('itemsPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ITBIS</label>
                <input type="number" step="0.01" value={formData.taxPrice} onChange={(e) => handleChange('taxPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Envío</label>
                <input type="number" step="0.01" value={formData.shippingPrice} onChange={(e) => handleChange('shippingPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <input type="number" step="0.01" value={formData.totalPrice} onChange={(e) => handleChange('totalPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold text-primary-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3 sticky bottom-0 bg-white">
          <button onClick={handleDownloadCustom} disabled={downloading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {downloading ? 'Generando...' : 'Descargar Factura Editada'}
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
