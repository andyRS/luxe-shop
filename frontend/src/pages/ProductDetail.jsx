import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, ZoomIn } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { productService } from '../services/productService';
import WishlistButton from '../components/WishlistButton';
import ProductReviews from '../components/ProductReviews';
import { formatUSD, formatRD } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Obtener producto de la API
      const productData = await productService.getById(id);
      
      setProduct(productData);
      if (productData.sizes?.length > 0) setSelectedSize(productData.sizes[0]);
      if (productData.colors?.length > 0) setSelectedColor(productData.colors[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Por favor selecciona una talla');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Por favor selecciona un color');
      return;
    }

    const cartItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };

    for (let i = 0; i < quantity; i++) {
      addItem(cartItem);
    }

    toast.success(`${quantity} ${quantity > 1 ? 'productos agregados' : 'producto agregado'} al carrito`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <Link to="/productos" className="btn-primary">
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/productos" className="text-primary-500 hover:text-primary-600 flex items-center gap-2 mb-4">
            <ArrowLeft size={20} />
            Volver a productos
          </Link>
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:text-primary-500">Inicio</Link>
            <span className="mx-2">/</span>
            <Link to="/productos" className="hover:text-primary-500">Productos</Link>
            <span className="mx-2">/</span>
            <span>{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Galería de Imágenes */}
          <div>
            <div
              className="bg-white rounded-xl overflow-hidden mb-4 shadow-md relative group cursor-zoom-in"
              onClick={() => setZoomOpen(true)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setZoomPos({
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                });
              }}
            >
              <img
                src={product.images?.[activeImage] || product.image}
                alt={product.name}
                className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover:opacity-80 transition-opacity" size={32} />
              </div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      activeImage === index ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-24 object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Zoom Modal */}
            {zoomOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-zoom-out"
                onClick={() => setZoomOpen(false)}
              >
                <img
                  src={product.images?.[activeImage] || product.image}
                  alt={product.name}
                  className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div>
            <div className="bg-white rounded-xl p-8 shadow-md">
              {product.isNewArrival && (
                <span className="badge bg-green-500 text-white mb-2">NUEVO</span>
              )}
              
              <h1 className="text-3xl font-display font-bold mb-2">{product.name}</h1>
              
              {product.brand && (
                <p className="text-gray-600 mb-4">Por {product.brand}</p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reseñas)
                </span>
              </div>

              {/* Precio */}
              <div className="mb-6">
                {product.discount > 0 ? (
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-primary-500">
                        {formatRD(finalPrice)}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        {formatRD(product.price)}
                      </span>
                      <span className="badge bg-red-500 text-white">
                        -{product.discount}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{formatUSD(finalPrice)} <span className="line-through ml-2">{formatUSD(product.price)}</span></p>
                    <p className="text-sm text-green-600 mt-1">
                      ¡Ahorras {formatRD(product.price - finalPrice)} ({formatUSD(product.price - finalPrice)})!
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-primary-500">
                      {formatRD(product.price)}
                    </span>
                    <p className="text-sm text-gray-400 mt-1">{formatUSD(product.price)}</p>
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Tallas */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Talla:</h3>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg transition-all ${
                          selectedSize === size
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colores */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Color:</h3>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg transition-all ${
                          selectedColor === color
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Cantidad:</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border border-gray-300 rounded-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600">
                    {product.stock} disponibles
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Agregar al Carrito
                </button>
                <WishlistButton productId={product._id} size="lg" className="!p-3 !rounded-lg" />
              </div>

              {/* Características */}
              <div className="border-t pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <Truck className="text-primary-500 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold">Envío Gratis</h4>
                    <p className="text-sm text-gray-600">En compras superiores a RD$ 2,925 (USD $50)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-primary-500 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold">Garantía de Calidad</h4>
                    <p className="text-sm text-gray-600">30 días de garantía</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción Detallada y Especificaciones */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Descripción Detallada</h2>
            <p className="text-gray-700 mb-4">{product.longDescription}</p>
            
            {product.features && (
              <>
                <h3 className="font-semibold mb-2">Características:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Especificaciones</h2>
            {product.specifications && (
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-700">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ProductReviews productId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
