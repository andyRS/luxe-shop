import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { formatUSD, formatRD } from '../utils/formatCurrency';

const Cart = () => {
  const { items, removeItem, incrementQuantity, decrementQuantity, clearCart, getTotal, getTotalItems } = useCartStore();

  const total = getTotal();
  const totalItems = getTotalItems();
  const tax = total * 0.18; // 18% ITBIS
  const shipping = total >= 50 ? 0 : 10;
  const finalTotal = total + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-xl p-12 shadow-md">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">
              ¡Explora nuestra tienda y encuentra productos increíbles!
            </p>
            <Link to="/productos" className="btn-primary inline-block">
              Ver Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-display font-bold mb-8">Carrito de Compras</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md">
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {totalItems} {totalItems === 1 ? 'Producto' : 'Productos'}
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Vaciar Carrito
                </button>
              </div>

              {/* Items */}
              <div className="divide-y">
                {items.map((item) => (
                  <div key={`${item._id}-${item.selectedSize}-${item.selectedColor}`} className="p-6">
                    <div className="flex gap-4">
                      {/* Imagen */}
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            {item.selectedSize && (
                              <p className="text-sm text-gray-600">Talla: {item.selectedSize}</p>
                            )}
                            {item.selectedColor && (
                              <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center">
                          {/* Cantidad */}
                          <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                            <button
                              onClick={() => decrementQuantity(item._id)}
                              className="p-2 hover:bg-gray-100 rounded-l-lg"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-1 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => incrementQuantity(item._id)}
                              className="p-2 hover:bg-gray-100 rounded-r-lg"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Precio */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-500">
                              {formatRD(item.price * item.quantity)}
                            </p>
                            <p className="text-xs text-gray-400">{formatUSD(item.price * item.quantity)}</p>
                            <p className="text-sm text-gray-500">
                              {formatRD(item.price)} c/u
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Continuar Comprando */}
            <Link
              to="/productos"
              className="mt-4 inline-block text-primary-500 hover:text-primary-600 font-medium"
            >
              ← Continuar comprando
            </Link>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                  <span>{formatRD(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ITBIS (18%)</span>
                  <span>{formatRD(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'GRATIS' : formatRD(shipping)}
                  </span>
                </div>
              </div>

              {total < 50 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    ¡Agrega {formatRD(50 - total)} ({formatUSD(50 - total)}) más para envío gratis!
                  </p>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <div className="text-right">
                  <span className="text-primary-500">{formatRD(finalTotal)}</span>
                  <p className="text-xs font-normal text-gray-400">{formatUSD(finalTotal)}</p>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full text-center flex items-center justify-center gap-2 mb-3"
              >
                Proceder al Pago
                <ArrowRight size={20} />
              </Link>

              <button className="btn-outline w-full">
                Guardar para Después
              </button>

              {/* Aceptamos */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2 text-center">Aceptamos:</p>
                <div className="flex justify-center gap-3">
                  <div className="bg-gray-100 px-3 py-2 rounded text-xs font-semibold">VISA</div>
                  <div className="bg-gray-100 px-3 py-2 rounded text-xs font-semibold">Mastercard</div>
                  <div className="bg-gray-100 px-3 py-2 rounded text-xs font-semibold">PayPal</div>
                </div>
              </div>

              {/* Garantías */}
              <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Compra segura garantizada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>30 días de garantía</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Envío rápido y confiable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
