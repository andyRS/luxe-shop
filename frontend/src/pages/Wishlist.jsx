import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../store/wishlistStore';
import useCartStore from '../store/cartStore';
import WishlistButton from '../components/WishlistButton';

const Wishlist = () => {
  const { items, loading, error, fetchWishlist, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Lista de Deseos</h1>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? 'producto guardado' : 'productos guardados'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu lista de deseos está vacía</h3>
            <p className="text-gray-600 mb-6">
              Guarda tus productos favoritos para comprarlos más tarde
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                <div className="relative aspect-square">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="absolute top-3 right-3">
                    <WishlistButton productId={product._id} size="md" />
                  </div>
                  {!product.stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-800">
                        Agotado
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-gray-500 mt-1 capitalize">{product.category}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-amber-600">
                      ${product.price?.toFixed(2)}
                    </span>
                    
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-400">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600">{product.rating?.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.stock}
                    className={`
                      w-full mt-4 py-2 px-4 rounded-lg font-semibold transition-colors
                      ${product.stock
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {product.stock ? 'Agregar al Carrito' : 'Sin Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
