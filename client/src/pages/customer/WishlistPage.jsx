import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Users, IndianRupee, Trash2 } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '../../api/user-api/wishlistApi';

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getWishlist();
      if (res.success) {
        setWishlist(res.data || []);
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

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ color: '#717171' }}>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
          Wishlist
        </h1>
        <p style={{ color: '#717171', marginTop: 6, fontSize: 15 }}>
          Venues you've saved for later. Revisit and book when you're ready.
        </p>
      </div>

      {error && (
        <div style={{ padding: 16, background: '#fce8e6', color: '#d93025', borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {wishlist.length === 0 && !loading && !error ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 360,
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #ebebeb',
            gap: 16,
            padding: 48,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#fff1f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={32} color="#ff385c" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>No saved venues yet</h2>
          <p style={{ fontSize: 14, color: '#717171', textAlign: 'center', maxWidth: 320 }}>
            Tap the heart icon on any venue to save it to your wishlist.
          </p>
          <a
            href="/home"
            style={{
              marginTop: 8,
              padding: '12px 28px',
              background: '#ff385c',
              color: '#fff',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#e0334e')}
            onMouseLeave={(e) => (e.target.style.background = '#ff385c')}
          >
            Discover Venues
          </a>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {wishlist.map((item) => {
            const venue = item.venueId;
            const isRemoving = removingId === item._id;
            const firstImage = venue?.images?.[0] || null;

            return (
              <div
                key={item._id}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #ebebeb',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  opacity: isRemoving ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                {/* Venue Image */}
                <div
                  style={{
                    width: '100%',
                    height: 180,
                    background: firstImage ? `url(${firstImage}) center/cover no-repeat` : '#f7f7f9',
                    display: firstImage ? 'block' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {!firstImage && (
                    <MapPin size={32} color="#d0d0d0" />
                  )}
                  {/* Remove button overlay */}
                  <button
                    onClick={() => handleRemove(venue?._id, item._id)}
                    disabled={isRemoving}
                    title="Remove from wishlist"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.92)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isRemoving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fff1f3')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.92)')}
                  >
                    {isRemoving ? (
                      <span style={{ fontSize: 10, color: '#ff385c' }}>...</span>
                    ) : (
                      <Trash2 size={16} color="#ff385c" />
                    )}
                  </button>
                </div>

                {/* Venue Details */}
                <div style={{ padding: '16px 18px 18px' }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1a1a1a',
                      marginBottom: 6,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {venue?.name || 'Unnamed Venue'}
                  </h3>

                  {venue?.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                      <MapPin size={14} color="#717171" />
                      <span
                        style={{
                          fontSize: 13,
                          color: '#717171',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {venue.location}
                      </span>
                    </div>
                  )}

                  <div style={{ height: 1, background: '#ebebeb', margin: '12px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {venue?.capacity && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Users size={14} color="#484848" />
                        <span style={{ fontSize: 13, color: '#484848' }}>{venue.capacity} guests</span>
                      </div>
                    )}
                    {venue?.pricing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IndianRupee size={14} color="#1a1a1a" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                          {venue.pricing.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  <a
                    href={`/venue/${venue?._id}`}
                    style={{
                      display: 'block',
                      marginTop: 14,
                      padding: '10px 0',
                      background: '#fff1f3',
                      color: '#ff385c',
                      borderRadius: 10,
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      textAlign: 'center',
                      transition: 'background 150ms, color 150ms',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ff385c';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff1f3';
                      e.currentTarget.style.color = '#ff385c';
                    }}
                  >
                    View Venue
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
