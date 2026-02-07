import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Search, Shield, Trash2, Plus, Minus, Heart } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useWishlistStore from '../store/wishlistStore';
import useSettingsStore from '../store/settingsStore';
import { formatUSD, formatRD } from '../utils/formatCurrency';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { items, getTotalItems, removeItem, incrementQuantity, decrementQuantity } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const settings = useSettingsStore(s => s.settings);
  const navigate = useNavigate();
  
  const storeName = settings?.storeName || 'LUXESHOP';
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 50;
  const exchangeRate = settings?.exchangeRate ?? 58.50;
  const freeShippingRD = (freeShippingThreshold * exchangeRate).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const totalItems = getTotalItems();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        {/* Top Bar */}
        <div className="border-b border-gray-200 py-2.5 bg-gradient-to-r from-purple-50 via-orange-50 to-pink-50">
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-700 font-medium flex items-center gap-2">
              <span className="text-lg">📦</span>
              <span>Envío gratis en compras mayores a RD$ {freeShippingRD} (USD ${freeShippingThreshold.toFixed(2)})</span>
            </p>
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Shield size={16} />
                      <span>Panel Admin</span>
                    </Link>
                  )}
                  <Link 
                    to="/perfil" 
                    className="text-gray-700 hover:text-purple-600 flex items-center gap-1.5 font-medium px-3 py-2 rounded-lg hover:bg-white/50 transition-all"
                  >
                    <User size={16} />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="text-gray-700 hover:text-red-600 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/50 transition-all"
                  >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <User size={16} />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link 
                    to="/registro" 
                    className="text-gray-700 hover:text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-white/70 transition-all"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-display font-bold text-gradient">
              {storeName.toUpperCase()}
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                Inicio
              </Link>
              <Link to="/productos" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                Productos
              </Link>
              <Link to="/categorias" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                Categorías
              </Link>
              <Link to="/ofertas" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                Ofertas
              </Link>
              <Link to="/contacto" className="text-gray-700 hover:text-primary-500 font-medium transition-colors">
                Contacto
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </form>

            {/* Cart & Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Wishlist Button */}
              {isAuthenticated && (
                <Link
                  to="/favoritos"
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart size={24} className="text-gray-700" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart size={24} className="text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              <Link
                to="/"
                className="block py-2 text-gray-700 hover:text-primary-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/productos"
                className="block py-2 text-gray-700 hover:text-primary-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                to="/categorias"
                className="block py-2 text-gray-700 hover:text-primary-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Categorías
              </Link>
              <Link
                to="/ofertas"
                className="block py-2 text-gray-700 hover:text-primary-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Ofertas
              </Link>
              <Link
                to="/contacto"
                className="block py-2 text-gray-700 hover:text-primary-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Carrito de Compras</h2>
              <button onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-4 border-b pb-4">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-primary-500 font-bold">{formatRD(item.price)}</p>
                        <p className="text-xs text-gray-400">{formatUSD(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => decrementQuantity(item._id)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => incrementQuantity(item._id)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors self-start"
                        title="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary-500">
                        {formatRD(useCartStore.getState().getTotal())}
                      </span>
                      <p className="text-xs text-gray-400">{formatUSD(useCartStore.getState().getTotal())}</p>
                    </div>
                  </div>
                  <Link
                    to="/checkout"
                    className="btn-primary w-full text-center block"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Proceder al Pago
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
