import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'}
      />
    ))}
  </div>
);

const getInitials = (firstName, lastName, email) => {
  if (firstName) return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  if (email) return email[0].toUpperCase();
  return '?';
};

const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const profile = review.userId?.profile;
  const firstName = profile?.firstName || '';
  const lastName = profile?.lastName || '';
  const email = review.userId?.email || '';
  const initials = getInitials(firstName, lastName, email);
  const displayName = firstName ? `${firstName} ${lastName}`.trim() : email.split('@')[0];
  const profileImage = profile?.profileImage || null;

  const date = new Date(review.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const COMMENT_LIMIT = 180;
  const isLong = review.comment && review.comment.length > COMMENT_LIMIT;
  const displayComment = isLong && !expanded
    ? review.comment.slice(0, COMMENT_LIMIT) + '…'
    : review.comment;

  return (
    <div className="py-6 border-b border-outline-variant last:border-0">
      {/* Reviewer Info */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {profileImage ? (
            <img
              src={profileImage}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border border-outline-variant"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-outline-variant">
              {initials}
            </div>
          )}
          <div>
            <p className="font-label-md text-on-surface">{displayName}</p>
            <p className="font-body-sm text-on-surface-variant">{date}</p>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mb-3">
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            {displayComment}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 mt-1 text-primary font-label-sm hover:underline"
            >
              {expanded ? (
                <><ChevronUp size={14} /> Show less</>
              ) : (
                <><ChevronDown size={14} /> Show more</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {review.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img.url)}
              className="w-20 h-20 rounded-xl overflow-hidden border border-outline-variant hover:opacity-90 transition-opacity"
            >
              <img src={img.url} alt={`Review image ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Review"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
