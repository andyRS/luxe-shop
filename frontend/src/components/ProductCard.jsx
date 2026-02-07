import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { formatUSD, formatRD } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast.success('Producto agregado al carrito', {
      icon: '🛒',
      duration: 2000,
    });
  };

  return (
    <div className="card group">
      {/* Imagen del Producto */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNewArrival && (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              NUEVO
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
              AGOTADO
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-white p-3 rounded-full hover:bg-primary-500 hover:text-white transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Agregar al carrito"
          >
            <ShoppingCart size={20} />
          </button>
          <button
            className="bg-white p-3 rounded-full hover:bg-primary-500 hover:text-white transition-all transform hover:scale-110"
            title="Agregar a favoritos"
          >
            <Heart size={20} />
          </button>
          <Link
            to={`/producto/${product._id}`}
            className="bg-white p-3 rounded-full hover:bg-primary-500 hover:text-white transition-all transform hover:scale-110"
            title="Ver detalles"
          >
            <Eye size={20} />
          </Link>
        </div>
      </div>

      {/* Información del Producto */}
      <div className="p-4">
        {/* Categoría */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.category}
        </p>

        {/* Nombre */}
        <Link to={`/producto/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Precio */}
        <div className="mb-3">
          {product.discount > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary-500">
                  {formatRD(product.price * (1 - product.discount / 100))}
                </span>
                <span className="text-xs text-gray-500 line-through">
                  {formatRD(product.price)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{formatUSD(product.price * (1 - product.discount / 100))}</p>
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-primary-500">
                {formatRD(product.price)}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">{formatUSD(product.price)}</p>
            </>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-4 h-4 ${
                  index < Math.floor(product.rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviews || 0} reseñas)
          </span>
        </div>

        {/* Stock Status */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-500 font-semibold mb-3">
            ¡Solo quedan {product.stock} unidades!
          </p>
        )}

        {/* Botón Agregar al Carrito */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
            product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
