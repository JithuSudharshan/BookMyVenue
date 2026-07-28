import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageSquarePlus } from 'lucide-react';
import { getVenueReviews } from '../../api/user-api/reviewApi';
import { AuthContext } from '../../store/AuthContext';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const StarDisplay = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'}
      />
    ))}
  </div>
);

const VenueReviewsSection = ({ venueId, readOnly = false, bookingId = null }) => {
  const { user } = useContext(AuthContext);

  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const LIMIT = 5;

  const fetchReviews = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      const res = await getVenueReviews(venueId, currentPage, LIMIT);
      if (res.success) {
        setReviews(res.data || []);
        setRatingSummary(res.ratingSummary || { averageRating: 0, totalReviews: 0 });
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch {
      // Non-fatal: reviews simply won't show
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchReviews(page);
  }, [fetchReviews, page]);

  const handleReviewSuccess = () => {
    setPage(1);
    fetchReviews(1);
  };

  const canWriteReview = Boolean(bookingId) && !readOnly && user?.role === 'customer';

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-sm text-on-surface">Reviews</h2>
          {ratingSummary.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <StarDisplay rating={ratingSummary.averageRating} />
              <span className="font-title-sm text-on-surface">
                {ratingSummary.averageRating.toFixed(1)}
              </span>
              <span className="font-body-md text-on-surface-variant">
                ({ratingSummary.totalReviews} {ratingSummary.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {canWriteReview && (
          <button
            id="write-review-btn"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary text-primary font-label-md hover:bg-primary hover:text-on-primary transition-all"
          >
            <MessageSquarePlus size={16} />
            Write a Review
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && reviews.length === 0 && (
        <div className="py-10 text-center bg-surface-container-low rounded-2xl border border-outline-variant">
          <Star size={32} className="text-on-surface-variant mx-auto mb-3" />
          <p className="font-label-md text-on-surface mb-1">No reviews yet</p>
          <p className="font-body-sm text-on-surface-variant">
            Be the first to share your experience with this venue.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && reviews.length > 0 && (
        <div>
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-body-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      {canWriteReview && showForm && (
        <ReviewForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          bookingId={bookingId}
          venueId={venueId}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default VenueReviewsSection;
