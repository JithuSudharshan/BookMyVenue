import React, { useState } from 'react';
import { Star, Edit2, Trash2, Calendar, X } from 'lucide-react';
import BaseModal from '../ui/BaseModal';
import { deleteReview } from '../../api/user-api/reviewApi';
import { toast } from 'sonner';

const StarDisplay = ({ rating, size = 18 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'}
      />
    ))}
  </div>
);

const ReviewDetailsModal = ({ isOpen, onClose, review, onEdit, onDeleteSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!review) return null;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      setDeleting(true);
      await deleteReview(review._id);
      toast.success('Review deleted successfully!');
      onClose();
      onDeleteSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Failed to delete review.');
    } finally {
      setDeleting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-50"
      >
        <Trash2 size={16} />
        {deleting ? 'Deleting...' : 'Delete Review'}
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            onEdit?.(review);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold transition-colors"
        >
          <Edit2 size={16} />
          Edit Review
        </button>
      </div>
    </div>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Your Review"
        footer={footer}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {/* Rating and Date */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <StarDisplay rating={review.rating || 0} />
              <span className="font-bold text-gray-900 text-sm">
                {review.rating ? `${review.rating} / 5` : 'No rating'}
              </span>
            </div>
            {review.createdAt && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={13} />
                <span>
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Comment */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Comment</h4>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {review.comment || <span className="italic text-gray-400">No comment provided.</span>}
            </p>
          </div>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Photos</h4>
              <div className="flex flex-wrap gap-2">
                {review.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <img src={img.url} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </BaseModal>

      {/* Lightbox Modal for Photo viewing */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={selectedImage} alt="Review enlarged" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white text-gray-900 rounded-full p-1.5 shadow-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewDetailsModal;
