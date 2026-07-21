import React, { useEffect, useState, useMemo } from 'react';
import { Heart, MapPin, Users, IndianRupee, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
    } catch (err) {
      alert(err.message || 'Failed to remove from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  // Fixed sort based on order added to wishlist (newest first)
  const sortedWishlist = useMemo(() => {
    let result = [...wishlist];
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
              Showing {wishlist.length > 0 ? (page - 1) * LIMIT + 1 : 0} - {(page - 1) * LIMIT + wishlist.length} of {totalItems} venues
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
      {wishlist.length === 0 && !loading && !error ? (
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
              const imageObj = (venue.images && venue.images.length > 0) ? venue.images[0] : null;
              const image = imageObj?.url || imageObj;

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
                    
                    {/* Toggle Button */}
                    <button 
                      className={`wl-toggle-btn ${isRemoving ? 'removing' : ''}`}
                      onClick={() => handleRemove(venue._id, item._id)}
                      disabled={isRemoving}
                      title="Remove from wishlist"
                    >
                      <Heart size={18} fill="currentColor" stroke="currentColor" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="wl-card-content">
                    <div className="wl-card-header">
                      <h3 className="wl-venue-name">{venue.name || 'Unnamed Venue'}</h3>
                    </div>
                    
                    {venue.location && (
                      <div className="wl-venue-loc">
                        <MapPin size={14} />
                        {typeof venue.location === 'object' && venue.location !== null
                          ? [venue.location.city, venue.location.state].filter(Boolean).join(', ')
                          : venue.location}
                      </div>
                    )}

                    <div className="wl-venue-stats">
                      {venue.capacity && (
                        <div className="wl-stat-chip">
                          <Users size={14} className="text-on-surface-variant" />
                          <span>Up to {venue.capacity} guests</span>
                        </div>
                      )}
                      {/* You can add Rating or other badges here later if backend provides it */}
                    </div>

                    <div className="wl-card-footer">
                      <div className="wl-price">
                        {venue.price ? (
                          <>
                            ₹{venue.price.toLocaleString('en-IN')} <span className="wl-price-label">/ day</span>
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
