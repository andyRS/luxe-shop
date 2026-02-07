import { useState, useEffect } from 'react';
import useWishlistStore from '../store/wishlistStore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const WishlistButton = ({ productId, size = 'md', showText = false, className = '' }) => {
  const { isInWishlist, toggleItem, loading } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isWished, setIsWished] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setIsWished(isInWishlist(productId));
  }, [productId, isInWishlist]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setAnimating(true);
    const result = await toggleItem(productId);
    
    if (result.success) {
      setIsWished(result.action === 'added');
    }

    setTimeout(() => setAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center gap-1
        rounded-full 
        transition-all duration-200
        ${isWished 
          ? 'bg-red-100 text-red-500 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-red-400'
        }
        ${animating ? 'scale-125' : 'scale-100'}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isWished ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={isWished ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        className={`${iconSizes[size]} transition-all duration-200`}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
        />
      </svg>
      {showText && (
        <span className="text-sm font-medium">
          {isWished ? 'Guardado' : 'Guardar'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
