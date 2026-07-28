import React, { useEffect, useState, useMemo } from 'react';
import { Heart, MapPin, Users, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, Sparkles, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getWishlist, removeFromWishlist } from '../../api/user-api/wishlistApi';
import './WishlistPage.css';

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    fetchWishlist(page);
  }, [page]);

  const fetchWishlist = async (currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWishlist(currentPage, LIMIT);
      if (res.success) {
        setWishlist(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalItems(res.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (venueId, wishlistId) => {
    try {
      setRemovingId(wishlistId);
      await removeFromWishlist(venueId);
      setWishlist((prev) => prev.filter((item) => item._id !== wishlistId));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err.message || 'Failed to remove from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  // Fixed sort based on order added to wishlist (newest first), filtering out inactive/deleted venues
  const sortedWishlist = useMemo(() => {
    let result = wishlist.filter(item => item.venueId && item.venueId.venueStatus !== 'inactive');
    result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return result;
  }, [wishlist]);

  if (loading && wishlist.length === 0) {
    return (
      <div className="wl-page flex flex-col items-center pt-20">
        <p className="text-on-surface-variant font-body-md">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wl-page">
      {/* Header */}
      <div className="wl-header">
        <div>
          <h1 className="wl-title">Wishlist</h1>
          <p className="wl-subtitle">
            Venues you've saved for later. Revisit and book when you're ready.
          </p>
          {!loading && totalItems > 0 && (
            <p className="mt-2 text-[13px] text-on-surface-variant">
              Showing {sortedWishlist.length > 0 ? (page - 1) * LIMIT + 1 : 0} - {(page - 1) * LIMIT + sortedWishlist.length} of {totalItems} venues
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {sortedWishlist.length === 0 && !loading && !error ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">
            <Heart size={36} fill="currentColor" />
          </div>
          <h2 className="wl-empty-title">No saved venues yet</h2>
          <p className="wl-empty-subtitle">
            Tap the heart icon on any venue to save it to your wishlist.
          </p>
          <a href="/" className="wl-empty-btn">
            Discover Venues
          </a>
        </div>
      ) : (
        <>
          <div className="wl-grid">
            {sortedWishlist.map((item) => {
              const venue = item.venueId || {};
              const isRemoving = removingId === item._id;
              
              // Pick primary image if specified, otherwise first image
              const imageObj = venue.images?.find(img => img.isPrimary) || venue.images?.[0];
              const image = imageObj?.url || (typeof imageObj === 'string' ? imageObj : null);

              // Location text format
              const locationText = typeof venue.location === 'object' && venue.location !== null
                ? [venue.location.address, venue.location.city, venue.location.state].filter(Boolean).join(', ')
                : (venue.location || 'Location unavailable');

              return (
                <div key={item._id} className="wl-card" style={{ opacity: isRemoving ? 0.6 : 1 }}>
                  {/* Image Wrap */}
                  <div className="wl-card-img-wrap">
                    {image ? (
                      <img src={image} alt={venue.name} className="wl-card-img" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant">
                        <ImageIcon size={40} />
                      </div>
                    )}
                    <div className="wl-card-overlay" />

                    {/* Booking Model Badge */}
                    {venue.bookingModel && (
                      <div className="wl-badge-booking">
                        <Clock size={12} />
                        <span>{venue.bookingModel === 'hourly' ? 'Hourly' : 'Daily'}</span>
                      </div>
                    )}
                    
                    {/* Toggle Button */}
                    <button 
                      className={`wl-toggle-btn ${isRemoving ? 'removing' : ''}`}
                      onClick={() => handleRemove(venue._id, item._id)}
                      disabled={isRemoving}
                      title="Remove from wishlist"
                    >
                      <Heart size={18} fill="#ff385c" stroke="#ff385c" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="wl-card-content">
                    <div className="wl-card-header">
                      <h3 className="wl-venue-name" title={venue.name}>{venue.name || 'Unnamed Venue'}</h3>
                      <div className="wl-rating-badge">
                        <Star size={13} fill="#f59e0b" stroke="#f59e0b" />
                        <span>{venue.averageRating ? Number(venue.averageRating).toFixed(1) : '4.8'}</span>
                        {venue.totalReviews > 0 && <span className="wl-review-count">({venue.totalReviews})</span>}
                      </div>
                    </div>
                    
                    {locationText && (
                      <div className="wl-venue-loc" title={locationText}>
                        <MapPin size={14} className="shrink-0 text-red-500" />
                        <span>{locationText}</span>
                      </div>
                    )}

                    <div className="wl-venue-stats">
                      {venue.capacity && (
                        <div className="wl-stat-chip" title={`Capacity: ${venue.capacity} guests`}>
                          <Users size={14} className="text-on-surface-variant" />
                          <span>Up to {venue.capacity.toLocaleString('en-IN')} guests</span>
                        </div>
                      )}

                      {/* Amenities Chips */}
                      {venue.amenities && venue.amenities.length > 0 && (
                        <div className="wl-amenities-wrap">
                          {venue.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="wl-amenity-chip">
                              {amenity}
                            </span>
                          ))}
                          {venue.amenities.length > 3 && (
                            <span className="wl-amenity-more" title={venue.amenities.slice(3).join(', ')}>
                              +{venue.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="wl-card-footer">
                      <div className="wl-price">
                        {venue.price ? (
                          <>
                            ₹{venue.price.toLocaleString('en-IN')} <span className="wl-price-label">/ {venue.bookingModel === 'hourly' ? 'hr' : 'day'}</span>
                          </>
                        ) : (
                          <span className="wl-price-label">Price on request</span>
                        )}
                      </div>
                      <a href={`/venues/${venue._id}`} className="wl-action-btn">
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="wl-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
              <button
                className={`flex items-center justify-center w-9 h-9 rounded-full border ${page === 1 ? 'bg-surface-container border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface-container-lowest border-outline-variant text-on-surface cursor-pointer'}`}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-on-surface-variant">
                Page {page} of {totalPages}
              </span>
              <button
                className={`flex items-center justify-center w-9 h-9 rounded-full border ${page === totalPages ? 'bg-surface-container border-outline-variant text-on-surface-variant cursor-not-allowed' : 'bg-surface-container-lowest border-outline-variant text-on-surface cursor-pointer'}`}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WishlistPage;
