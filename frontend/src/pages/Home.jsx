import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TruckIcon, ShieldCheck, CreditCard, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import SEO from '../components/SEO';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Descubre Tu Estilo Único",
      description: "Las mejores prendas de moda premium con calidad excepcional y diseños exclusivos",
      image: "/images/hero-woman-beige.png",
      cta: "Ver Colección",
      link: "/productos"
    },
    {
      title: "Nueva Colección 2026",
      description: "Elegancia y sofisticación en cada pieza. Descubre las últimas tendencias",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1536&h=1024&fit=crop&auto=format",
      cta: "Explorar Ahora",
      link: "/productos"
    },
    {
      title: "Elegancia Profesional",
      description: "Conjuntos ejecutivos premium con estilo sofisticado y calidad excepcional",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1536&h=1024&fit=crop&auto=format",
      cta: "Ver Colección",
      link: "/productos"
    },
    {
      title: "Estilo Minimalista",
      description: "Prendas atemporales que definen tu personalidad con elegancia y simplicidad",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1536&h=1024&fit=crop&auto=format",
      cta: "Descubrir Más",
      link: "/productos"
    },
    {
      title: "Alta Costura",
      description: "Diseños exclusivos que reflejan lujo y sofisticación en cada detalle",
      image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1536&h=1024&fit=crop&auto=format",
      cta: "Ver Colección",
      link: "/productos"
    },
    {
      title: "Tendencia Urbana",
      description: "Moda contemporánea para la mujer moderna y decidida de hoy",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1536&h=1024&fit=crop&auto=format",
      cta: "Explorar Estilo",
      link: "/productos"
    },
    {
      title: "Colección Ejecutiva",
      description: "Piezas sofisticadas para la profesional que marca la diferencia",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1536&h=1024&fit=crop&auto=format",
      cta: "Ver Más",
      link: "/productos"
    },
    {
      title: "Glamour Nocturno",
      description: "Diseños deslumbrantes para ocasiones especiales inolvidables",
      image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1536&h=1024&fit=crop&auto=format",
      cta: "Descubrir",
      link: "/productos"
    },
    {
      title: "Casual Chic",
      description: "Comodidad y estilo se fusionan en perfecta armonía para tu día a día",
      image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1536&h=1024&fit=crop&auto=format",
      cta: "Ver Colección",
      link: "/productos"
    },
    {
      title: "Ofertas Especiales",
      description: "Hasta 30% de descuento en productos seleccionados. No te lo pierdas",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1536&h=1024&fit=crop&auto=format",
      cta: "Ver Ofertas",
      link: "/ofertas"
    }
  ];

  useEffect(() => {
    fetchFeaturedProducts();
    
    // Auto-slide every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const fetchFeaturedProducts = async () => {
    try {
      // Obtener productos destacados de la API
      const data = await productService.getAll({ limit: 4 });
      setFeaturedProducts(data.products || []);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <TruckIcon size={40} />,
      title: 'Envío Gratis',
      description: 'En compras superiores a RD$ 2,925 (USD $50)'
    },
    {
      icon: <ShieldCheck size={40} />,
      title: 'Compra Segura',
      description: 'Protección garantizada'
    },
    {
      icon: <CreditCard size={40} />,
      title: 'Pagos Flexibles',
      description: 'Múltiples métodos de pago'
    },
    {
      icon: <Headphones size={40} />,
      title: 'Soporte 24/7',
      description: 'Siempre estamos para ayudarte'
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="LuxeShop - Moda Premium República Dominicana"
        description="Tu tienda de moda premium con las últimas tendencias. Vestidos, blusas, accesorios y más con envío a toda República Dominicana."
        url="/"
      />
      {/* Hero Section - Carousel Premium */}
      <section className="relative min-h-[100svh] lg:min-h-[90vh] bg-gray-900 overflow-hidden">
        {/* Background Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradients - Ajustados para móvil */}
            <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-gray-900 via-gray-900/90 lg:via-gray-900/80 to-gray-900/60 lg:to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 lg:via-transparent to-transparent"></div>
          </div>
        ))}

        {/* Decorative Elements - Solo desktop */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-primary-400/10 rounded-full blur-[100px] animate-pulse animation-delay-2000"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full min-h-[100svh] lg:min-h-[90vh] flex items-center pt-24 sm:pt-28 lg:pt-32 pb-32 lg:pb-28">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
              
              {/* Left Content */}
              <div className="space-y-5 lg:space-y-8 text-center lg:text-left mt-4 lg:mt-0">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                  </span>
                  <span className="text-primary-300 font-semibold text-xs lg:text-sm tracking-widest uppercase">Nueva Temporada 2026</span>
                </div>
                
                {/* Title with Animation */}
                <div className="overflow-hidden">
                  <h1 
                    key={currentSlide}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] lg:leading-[1.05] tracking-tight animate-fade-in-up"
                  >
                    {heroSlides[currentSlide].title.split(' ').map((word, i) => (
                      <span key={i} className="inline-block mr-2 lg:mr-4">
                        {word}
                      </span>
                    ))}
                  </h1>
                </div>
                
                {/* Description */}
                <p 
                  key={`desc-${currentSlide}`}
                  className="text-base sm:text-lg lg:text-2xl text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in px-2 lg:px-0"
                >
                  {heroSlides[currentSlide].description}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start pt-2 lg:pt-4 px-4 sm:px-0">
                  <Link 
                    to={heroSlides[currentSlide].link}
                    className="group relative inline-flex items-center justify-center gap-2 lg:gap-3 px-6 sm:px-8 lg:px-10 py-3.5 lg:py-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-base lg:text-lg font-bold rounded-full shadow-[0_0_40px_rgba(240,118,11,0.4)] hover:shadow-[0_0_60px_rgba(240,118,11,0.6)] transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10">{heroSlides[currentSlide].cta}</span>
                    <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link 
                    to="/productos"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-3.5 lg:py-5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-base lg:text-lg font-semibold rounded-full border border-white/30 hover:border-white/50 transition-all duration-300"
                  >
                    Explorar Catálogo
                  </Link>
                </div>

                {/* Stats - Ocultas en móvil muy pequeño */}
                <div className="hidden sm:grid grid-cols-3 gap-4 lg:gap-8 pt-4 lg:pt-8 max-w-lg mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white">500<span className="text-primary-500">+</span></div>
                    <div className="text-xs lg:text-sm text-gray-400 mt-1 uppercase tracking-wider">Productos</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white">10k<span className="text-primary-500">+</span></div>
                    <div className="text-xs lg:text-sm text-gray-400 mt-1 uppercase tracking-wider">Clientes</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white">4.9<span className="text-primary-500">★</span></div>
                    <div className="text-xs lg:text-sm text-gray-400 mt-1 uppercase tracking-wider">Rating</div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Image Preview Cards - Solo Desktop */}
              <div className="hidden lg:block relative">
                <div className="relative h-[600px]">
                  {/* Main Large Image */}
                  <div className="absolute top-0 right-0 w-[85%] h-[500px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={heroSlides[currentSlide].image}
                      alt={heroSlides[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                    
                    {/* Floating Price Tag */}
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Desde</p>
                      <p className="text-2xl font-bold text-gray-900">RD$ 2,924<span className="text-lg text-gray-500">.50</span></p>
                      <p className="text-xs text-gray-400">USD $49.99</p>
                    </div>
                  </div>
                  
                  {/* Next Slide Preview */}
                  <div 
                    className="absolute bottom-0 left-0 w-[200px] h-[260px] rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 cursor-pointer transform hover:scale-105 transition-all duration-300"
                    onClick={nextSlide}
                  >
                    <img
                      src={heroSlides[(currentSlide + 1) % heroSlides.length].image}
                      alt="Siguiente"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gray-900/40 hover:bg-gray-900/20 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <ChevronRight className="w-6 h-6 text-gray-900" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-xs font-medium truncate">Siguiente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar - Responsive */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pt-16 lg:pt-8">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 pb-4 lg:pb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              
              {/* Navigation Arrows - Centrados en móvil */}
              <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
                <button
                  onClick={prevSlide}
                  className="group w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-primary-500 flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-primary-500"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
                <button
                  onClick={nextSlide}
                  className="group w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-primary-500 flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-primary-500"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>

              {/* Progress Indicators - Simplificados en móvil */}
              <div className="flex items-center gap-2 sm:gap-4 order-1 sm:order-2">
                <span className="text-white/60 text-xs sm:text-sm font-medium">
                  {String(currentSlide + 1).padStart(2, '0')}
                </span>
                <div className="flex gap-1.5 sm:gap-2">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className="group relative h-1 rounded-full overflow-hidden transition-all duration-500"
                      style={{ width: index === currentSlide ? '32px' : '8px' }}
                      aria-label={`Ir a slide ${index + 1}`}
                    >
                      <div className="absolute inset-0 bg-white/30"></div>
                      <div 
                        className={`absolute inset-0 bg-primary-500 transition-transform duration-500 origin-left ${
                          index === currentSlide ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      ></div>
                    </button>
                  ))}
                </div>
                <span className="text-white/60 text-xs sm:text-sm font-medium">
                  {String(heroSlides.length).padStart(2, '0')}
                </span>
              </div>

              {/* Scroll Indicator - Solo desktop grande */}
              <div className="hidden lg:flex items-center gap-3 text-white/60 order-3">
                <span className="text-sm uppercase tracking-wider">Scroll</span>
                <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
                  <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-primary-500 flex justify-center mb-4 transform hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías Destacadas */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">Categorías Populares</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Explora nuestra selección curada de las mejores prendas para cada ocasión</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Vestidos', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop' },
              { name: 'Casual', image: 'https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=800&h=1000&fit=crop' },
              { name: 'Formal', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&h=1000&fit=crop' }
            ].map((category, index) => (
              <Link
                key={index}
                to={`/productos?category=${category.name}`}
                className="relative group overflow-hidden rounded-2xl h-80 shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                  <div className="p-8 text-white transform group-hover:translate-y-0 translate-y-2 transition-transform">
                    <h3 className="text-3xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm flex items-center gap-2 opacity-90">
                      Ver Colección <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2">Productos Destacados</h2>
              <p className="text-gray-600">Lo mejor de nuestra colección exclusiva</p>
            </div>
            <Link 
              to="/productos" 
              className="hidden md:flex text-primary-500 hover:text-primary-600 font-bold items-center gap-2 bg-primary-50 px-6 py-3 rounded-xl hover:bg-primary-100 transition-all"
            >
              Ver Todos <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="mt-10 text-center md:hidden">
                <Link 
                  to="/productos" 
                  className="inline-flex text-primary-500 hover:text-primary-600 font-bold items-center gap-2 bg-primary-50 px-6 py-3 rounded-xl hover:bg-primary-100 transition-all"
                >
                  Ver Todos <ArrowRight size={20} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Suscríbete a Nuestro Newsletter
            </h2>
            <p className="text-xl mb-10 text-white/90 leading-relaxed">
              Recibe ofertas exclusivas y las últimas tendencias directamente en tu correo
            </p>
            <form className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg"
                />
                <button
                  type="submit"
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  Suscribirse Gratis
                </button>
              </div>
              <p className="text-white/70 text-sm mt-4">🎁 Obtén 15% de descuento en tu primera compra</p>
            </form>
          </div>
        </div>
      </section>

      {/* Banner Promocional */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-12 md:p-16 text-white overflow-hidden shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-300/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
                ✨ Nuevo Lanzamiento
              </div>
              <h2 className="text-3xl md:text-6xl font-display font-bold mb-6 leading-tight">
                ¡Nueva Colección Primavera 2026!
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-white/90">
                Hasta 30% de descuento en productos seleccionados
              </p>
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 bg-white text-purple-600 px-10 py-5 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl text-lg"
              >
                Comprar Ahora
                <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
