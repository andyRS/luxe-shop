import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Grid3X3, Sparkles } from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';

const categoryData = [
  {
    slug: 'vestidos',
    name: 'Vestidos',
    description: 'Vestidos elegantes para toda ocasión',
    emoji: '👗',
    gradient: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50',
    textAccent: 'text-pink-600',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
  },
  {
    slug: 'pantalones',
    name: 'Pantalones',
    description: 'Pantalones modernos y cómodos',
    emoji: '👖',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textAccent: 'text-blue-600',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
  },
  {
    slug: 'conjuntos',
    name: 'Conjuntos',
    description: 'Sets coordinados de última tendencia',
    emoji: '👚',
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    textAccent: 'text-purple-600',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
  },
  {
    slug: 'blusas',
    name: 'Blusas',
    description: 'Blusas casuales y formales',
    emoji: '👕',
    gradient: 'from-primary-500 to-orange-600',
    bgLight: 'bg-orange-50',
    textAccent: 'text-primary-600',
    image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80',
  },
  {
    slug: 'faldas',
    name: 'Faldas',
    description: 'Faldas con estilo para cada momento',
    emoji: '💃',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textAccent: 'text-emerald-600',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80',
  },
  {
    slug: 'accesorios',
    name: 'Accesorios',
    description: 'Complementos que marcan la diferencia',
    emoji: '💎',
    gradient: 'from-amber-500 to-yellow-600',
    bgLight: 'bg-amber-50',
    textAccent: 'text-amber-600',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80',
  },
];

const Categories = () => {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productCounts, setProductCounts] = useState({});

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      fetchCategoryProducts(activeCategory);
    }
  }, [activeCategory]);

  const fetchAllProducts = async () => {
    try {
      const data = await productService.getAll();
      const allProducts = data.products || data;
      // Count products per category
      const counts = {};
      allProducts.forEach(p => {
        const cat = (p.category || '').toLowerCase();
        counts[cat] = (counts[cat] || 0) + 1;
      });
      setProductCounts(counts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategoryProducts = async (category) => {
    try {
      setLoading(true);
      const data = await productService.getAll({ category });
      setProducts(data.products || data);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCatData = categoryData.find(c => c.slug === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-pink-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-primary-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Grid3X3 size={18} />
              <span className="font-semibold text-sm">Explora por categoría</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              {activeCatData ? activeCatData.name : 'Categorías'}
            </h1>
            <p className="text-lg md:text-xl text-purple-200">
              {activeCatData
                ? activeCatData.description
                : 'Encuentra exactamente lo que buscas navegando por nuestras categorías de moda premium.'
              }
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Category Grid */}
      <section className="container-custom -mt-8 relative z-20 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                to={`/categorias?cat=${cat.slug}`}
                className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${isActive ? 'ring-3 ring-primary-500 ring-offset-2' : ''}`}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-80 z-10`}></div>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <span className="text-5xl mb-2 block">{cat.emoji}</span>
                      <h3 className="text-2xl font-display font-bold">{cat.name}</h3>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 right-3 z-30 bg-white text-primary-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ✓ Seleccionada
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-3">{cat.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`${cat.bgLight} ${cat.textAccent} text-sm font-semibold px-3 py-1 rounded-full`}>
                      {productCounts[cat.slug] || 0} productos
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-500 group-hover:text-primary-500 transition-colors">
                      Explorar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Category Products (when a category is selected) */}
      {activeCategory && (
        <section className="container-custom mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                {activeCatData?.emoji} {activeCatData?.name || activeCategory}
              </h2>
              <p className="text-gray-600 mt-1">{products.length} productos encontrados</p>
            </div>
            <Link to="/categorias" className="text-sm text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1">
              Ver todas las categorías <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md">
              <ShoppingBag size={56} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No hay productos en esta categoría</h3>
              <p className="text-gray-500 mb-6">Pronto agregaremos más productos. ¡Vuelve a visitarnos!</p>
              <Link to="/productos" className="btn-primary inline-flex items-center gap-2">
                <ShoppingBag size={18} /> Ver Todos los Productos
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center justify-center gap-3 mb-3">
              <Sparkles className="text-yellow-500" size={28} /> ¿Por qué elegir LuxeShop?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '500+', label: 'Productos', icon: '🛍️' },
              { value: '50+', label: 'Marcas', icon: '✨' },
              { value: '2K+', label: 'Clientes felices', icon: '😍' },
              { value: '24/7', label: 'Soporte', icon: '💬' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all">
                <span className="text-3xl block mb-2">{stat.icon}</span>
                <p className="text-3xl md:text-4xl font-display font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;
