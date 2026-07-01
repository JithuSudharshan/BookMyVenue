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
      <div className="wl-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: '#717171' }}>Loading wishlist...</p>
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
            <p style={{ marginTop: '8px', fontSize: '13px', color: '#717171' }}>
              Showing {wishlist.length > 0 ? (page - 1) * LIMIT + 1 : 0} - {(page - 1) * LIMIT + wishlist.length} of {totalItems} venues
            </p>
          )}
        </div>
        

      </div>

      {error && (
        <div style={{ padding: 16, background: '#fce8e6', color: '#d93025', borderRadius: 8, marginBottom: 24 }}>
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
          <a href="/home" className="wl-empty-btn">
            Discover Venues
          </a>
        </div>
      ) : (
        <>
          <div className="wl-grid">
            {sortedWishlist.map((item) => {
              const venue = item.venueId || {};
              const isRemoving = removingId === item._id;
              const image = (venue.images && venue.images.length > 0) ? venue.images[0] : null;

              return (
                <div key={item._id} className="wl-card" style={{ opacity: isRemoving ? 0.6 : 1 }}>
                  {/* Image Wrap */}
                  <div className="wl-card-img-wrap">
                    {image ? (
                      <img src={image} alt={venue.name} className="wl-card-img" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#a0a0a0' }}>
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
                        {venue.location}
                      </div>
                    )}

                    <div className="wl-venue-stats">
                      {venue.capacity && (
                        <div className="wl-stat-chip">
                          <Users size={14} color="#717171" />
                          <span>{venue.capacity} Guests</span>
                        </div>
                      )}
                      {/* You can add Rating or other badges here later if backend provides it */}
                    </div>

                    <div className="wl-card-footer">
                      <div className="wl-price">
                        {venue.pricing ? (
                          <>
                            ₹{venue.pricing.toLocaleString('en-IN')} <span className="wl-price-label">/ day</span>
                          </>
                        ) : (
                          <span className="wl-price-label">Price on request</span>
                        )}
                      </div>
                      <a href={`/venue/${venue._id}`} className="wl-action-btn">
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
                className="wl-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e0e0e0', background: page === 1 ? '#f5f5f5' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#a0a0a0' : '#222' }}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="wl-page-text" style={{ fontSize: '14px', color: '#717171', fontWeight: 500 }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="wl-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e0e0e0', background: page === totalPages ? '#f5f5f5' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#a0a0a0' : '#222' }}
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
