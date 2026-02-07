import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Clock, Percent, Gift, Sparkles, ArrowRight, ShoppingBag, Ticket } from 'lucide-react';
import { productService } from '../services/productService';
import { formatRD } from '../utils/formatCurrency';
import ProductCard from '../components/ProductCard';

const Offers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchData();
    // Countdown to end of month
    const timer = setInterval(() => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth - now;
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, couponsRes] = await Promise.all([
        productService.getAll(),
        fetch('http://localhost:5000/api/coupons/validate/BIENVENIDO10', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderTotal: 100 })
        }).then(() => {
          // Fetch available coupons - we'll use known ones
          return [
            { code: 'BIENVENIDO10', discount: 10, type: 'percentage', description: '10% de descuento en tu primera compra' },
            { code: 'ENVIOGRATIS', discount: 0, type: 'freeShipping', description: 'Envío gratis en cualquier compra' },
            { code: 'LUXE20', discount: 20, type: 'percentage', description: '20% de descuento en compras +RD$ 5,850 (USD $100)' },
            { code: 'VERANO2025', discount: 15, type: 'percentage', description: '15% de descuento - Colección Verano' },
          ];
        }).catch(() => [])
      ]);
      const allProducts = productsData.products || productsData;
      // Sort by discount (products with discount > 0 first)
      const sorted = [...allProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0));
      setProducts(sorted);
      setCoupons([
        { code: 'BIENVENIDO10', discount: 10, type: 'percentage', description: '10% de descuento en tu primera compra', minPurchase: 0, color: 'from-purple-500 to-purple-600' },
        { code: 'ENVIOGRATIS', discount: 0, type: 'freeShipping', description: 'Envío gratis en cualquier compra', minPurchase: 0, color: 'from-green-500 to-green-600' },
        { code: 'LUXE20', discount: 20, type: 'percentage', description: '20% de descuento en compras mayores a RD$ 5,850 (USD $100)', minPurchase: 100, color: 'from-primary-500 to-primary-600' },
        { code: 'VERANO2025', discount: 15, type: 'percentage', description: '15% de descuento - Colección Verano', minPurchase: 50, color: 'from-pink-500 to-pink-600' },
      ]);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const discountedProducts = products.filter(p => (p.discount || 0) > 0);
  const newProducts = products.filter(p => p.isNewArrival).slice(0, 4);
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        </div>
        <div className="container-custom py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles size={18} className="text-yellow-300" />
              <span className="font-semibold text-sm">¡Ofertas por tiempo limitado!</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Ofertas <span className="text-yellow-300">Especiales</span>
            </h1>
            <p className="text-lg md:text-xl text-orange-100 mb-8">
              Descubre descuentos increíbles en las mejores prendas de moda. ¡No te pierdas estas oportunidades únicas!
            </p>

            {/* Countdown */}
            <div className="flex justify-center gap-4 mb-8">
              {[
                { value: countdown.days, label: 'Días' },
                { value: countdown.hours, label: 'Horas' },
                { value: countdown.minutes, label: 'Min' },
                { value: countdown.seconds, label: 'Seg' },
              ].map((item, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[70px]">
                  <p className="text-3xl md:text-4xl font-bold font-display">{String(item.value).padStart(2, '0')}</p>
                  <p className="text-xs text-orange-200 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>

            <Link to="/productos" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-8 py-4 rounded-full hover:bg-orange-50 transition-all transform hover:scale-105 shadow-xl">
              <ShoppingBag size={20} /> Ver Todas las Ofertas <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Coupons Section */}
      <section className="container-custom -mt-6 relative z-20 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map((coupon, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`bg-gradient-to-r ${coupon.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <Ticket size={24} />
                  {coupon.type === 'percentage' ? (
                    <span className="text-3xl font-display font-bold">{coupon.discount}%</span>
                  ) : (
                    <span className="text-lg font-bold">GRATIS</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                {coupon.minPurchase > 0 && (
                  <p className="text-xs text-gray-400 mb-2">Compra mínima: {formatRD(coupon.minPurchase)}</p>
                )}
                <button onClick={() => copyCoupon(coupon.code)}
                  className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-3 font-mono text-sm font-bold text-gray-800 transition-colors flex items-center justify-center gap-2">
                  {copiedCoupon === coupon.code ? (
                    <><span className="text-green-600">✓ ¡Copiado!</span></>
                  ) : (
                    <><Tag size={14} /> {coupon.code}</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Discounted Products */}
      {discountedProducts.length > 0 && (
        <section className="container-custom mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                <Percent className="text-red-500" size={32} /> Productos con Descuento
              </h2>
              <p className="text-gray-600 mt-1">Ahorra en grande con estos descuentos exclusivos</p>
            </div>
            <Link to="/productos" className="hidden md:flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
              Ver todos <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountedProducts.slice(0, 8).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {discountedProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow">
              <Tag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No hay productos con descuento en este momento</p>
              <p className="text-gray-400 mt-1">¡Vuelve pronto para nuevas ofertas!</p>
            </div>
          )}
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-white py-16 mb-16">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                  <Sparkles className="text-yellow-500" size={32} /> Productos Destacados
                </h2>
                <p className="text-gray-600 mt-1">Lo mejor de nuestra colección seleccionado para ti</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="container-custom mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                <Gift className="text-purple-500" size={32} /> Nuevos Productos
              </h2>
              <p className="text-gray-600 mt-1">Recién llegados a nuestra tienda</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All Products if no discounted ones */}
      {discountedProducts.length === 0 && products.length > 0 && (
        <section className="container-custom mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-gray-900">Todos Nuestros Productos</h2>
            <p className="text-gray-600 mt-1">Explora nuestro catálogo completo</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/productos" className="inline-flex items-center gap-2 btn-primary px-8 py-3">
              Ver Todos los Productos <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-purple-900 to-primary-700 py-16">
        <div className="container-custom text-center text-white">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">¿No encontraste lo que buscabas?</h2>
          <p className="text-purple-200 text-lg mb-8 max-w-2xl mx-auto">
            Nuevas ofertas cada semana. Suscríbete a nuestro newsletter y sé el primero en enterarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input type="email" placeholder="tu@email.com"
              className="flex-1 px-6 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            <button className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105">
              Suscribirse
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;
