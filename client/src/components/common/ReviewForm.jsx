import React, { useState, useRef } from 'react';
import { Star, X, ImagePlus } from 'lucide-react';
import BaseModal from '../ui/BaseModal';
import { submitReview, editReview } from '../../api/user-api/reviewApi';
import { toast } from 'sonner';

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-1 transition-transform hover:scale-110"
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        <Star
          size={28}
          className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'}
        />
      </button>
    ))}
  </div>
);

const ReviewForm = ({ isOpen, onClose, bookingId, venueId, existingReview = null, onSuccess }) => {
  const isEditMode = Boolean(existingReview);

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_IMAGES = 3;
  const MAX_COMMENT = 1000;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - imagePreviews.length;
    const toAdd = files.slice(0, remaining);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, { file, preview: ev.target.result }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    const formData = new FormData();
    if (!isEditMode) formData.append('bookingId', bookingId);
    formData.append('rating', rating);
    if (comment.trim()) formData.append('comment', comment.trim());
    imagePreviews.forEach(({ file }) => formData.append('images', file));

    try {
      setSubmitting(true);
      if (isEditMode) {
        await editReview(existingReview._id, formData);
        toast.success('Review updated successfully!');
      } else {
        await submitReview(formData);
        toast.success('Review submitted successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={handleClose}
        disabled={submitting}
        className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="review-form"
        disabled={submitting || rating === 0}
        className="px-5 py-2.5 text-sm font-semibold text-on-primary bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-sm disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : isEditMode ? 'Update Review' : 'Submit Review'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Your Review' : 'Write a Review'}
      maxWidth="max-w-lg"
      footer={footer}
      closeOnOutsideClick={!submitting}
    >
      <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating */}
        <div>
          <label className="block font-label-md text-on-surface mb-2">Your Rating *</label>
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <p className="text-on-surface-variant font-body-sm mt-1">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block font-label-md text-on-surface mb-2">
            Your Review <span className="text-on-surface-variant font-body-sm">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
            rows={4}
            placeholder="Share your experience with this venue…"
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface font-body-md placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <p className="text-right font-body-sm text-on-surface-variant mt-1">
            {comment.length}/{MAX_COMMENT}
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-label-md text-on-surface mb-2">
            Photos <span className="text-on-surface-variant font-body-sm">(optional, up to 3)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-outline-variant">
                <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {imagePreviews.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus size={20} />
                <span className="text-xs font-medium">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </form>
    </BaseModal>
  );
};

export default ReviewForm;
