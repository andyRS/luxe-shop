import { useState, useEffect } from 'react';
import { Star, ThumbsUp, User, ChevronDown, ChevronUp } from 'lucide-react';
import useAuthStore from '../store/authStore';
import * as reviewService from '../services/reviewService';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
    if (isAuthenticated) {
      checkCanReview();
    }
  }, [productId, page, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(productId, page, 5);
      setReviews(response.reviews);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await reviewService.canReviewProduct(productId);
      setCanReview(response.canReview);
    } catch (error) {
      setCanReview(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.createReview({
        product: productId,
        ...reviewForm
      });
      toast.success('¡Reseña publicada exitosamente!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setPage(1);
      fetchReviews();
      setCanReview(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al publicar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para marcar reseñas como útiles');
      return;
    }
    try {
      const response = await reviewService.markReviewHelpful(reviewId);
      setReviews(reviews.map(r => 
        r._id === reviewId 
          ? { ...r, helpfulCount: response.helpfulCount }
          : r
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al marcar como útil');
    }
  };

  const toggleReviewExpanded = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const StarRating = ({ rating, onRate, interactive = false, size = 'md' }) => {
    const sizes = { sm: 16, md: 20, lg: 24 };
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              size={sizes[size]}
              className={`${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reseñas de Clientes</h2>
        {canReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
          >
            Escribir Reseña
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Tu Reseña</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación
            </label>
            <StarRating
              rating={reviewForm.rating}
              onRate={(rating) => setReviewForm({ ...reviewForm, rating })}
              interactive={true}
              size="lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título (opcional)
            </label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              placeholder="Resume tu experiencia"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario
            </label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Cuéntanos tu experiencia con este producto..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{reviewForm.comment.length}/1000 caracteres</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : 'Publicar Reseña'}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Star size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aún no hay reseñas</p>
          <p className="text-sm mt-2">Sé el primero en compartir tu opinión sobre este producto</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user?.name || 'Usuario'}
                      {review.isVerifiedPurchase && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Compra verificada
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-800 mt-3">{review.title}</h4>
              )}

              <div className="mt-2">
                <p className={`text-gray-600 ${!expandedReviews[review._id] && review.comment.length > 200 ? 'line-clamp-3' : ''}`}>
                  {review.comment}
                </p>
                {review.comment.length > 200 && (
                  <button
                    onClick={() => toggleReviewExpanded(review._id)}
                    className="text-amber-600 text-sm font-medium mt-1 flex items-center gap-1 hover:text-amber-700"
                  >
                    {expandedReviews[review._id] ? (
                      <>Ver menos <ChevronUp size={16} /></>
                    ) : (
                      <>Ver más <ChevronDown size={16} /></>
                    )}
                  </button>
                )}
              </div>

              <button
                onClick={() => handleHelpful(review._id)}
                className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors"
              >
                <ThumbsUp size={16} />
                <span>Útil ({review.helpfulCount || 0})</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-gray-600">
            Página {page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
