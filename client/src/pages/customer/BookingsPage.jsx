import React, { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users, IndianRupee, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCustomerBookings } from "../../api/user-api/bookingApi";

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

  const fetchBookings = async (currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerBookings(currentPage, limit);
      if (res.success) {
        setBookings(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return { bg: '#e6f4ea', text: '#1e8e3e' };
      case 'pending':
        return { bg: '#fef7e0', text: '#b06000' };
      case 'cancelled':
        return { bg: '#fce8e6', text: '#d93025' };
      case 'refunded':
        return { bg: '#e8f0fe', text: '#1a73e8' };
      default:
        return { bg: '#f1f3f4', text: '#5f6368' };
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ color: '#717171' }}>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
          My Bookings
        </h1>
        <p style={{ color: '#717171', marginTop: 6, fontSize: 15 }}>
          View and manage all your venue bookings in one place.
        </p>
      </div>

      {error && (
        <div style={{ padding: 16, background: '#fce8e6', color: '#d93025', borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {bookings.length === 0 && !loading && !error ? (
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
            <CalendarDays size={32} color="#ff385c" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>No bookings yet</h2>
          <p style={{ fontSize: 14, color: '#717171', textAlign: 'center', maxWidth: 320 }}>
            You haven't booked any venues yet. Explore venues and make your first booking!
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
          >
            Explore Venues
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {bookings.map((booking) => {
            const bookingStatusStyle = getStatusBadgeColor(booking.bookingStatus);
            const paymentStatusStyle = getStatusBadgeColor(booking.paymentStatus);
            const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const venueName = booking.venueId?.name || 'Unknown Venue';

            return (
              <div
                key={booking._id}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #ebebeb',
                  padding: 24,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
                      {venueName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#717171', fontSize: 14 }}>
                      <CalendarDays size={16} />
                      <span>{bookingDate}</span>
                      {booking.slotIds && booking.slotIds.length > 0 && (
                        <>
                          <span style={{ margin: '0 4px' }}>•</span>
                          <Clock size={16} />
                          <span>{booking.slotIds.length} Slot(s)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: bookingStatusStyle.bg,
                        color: bookingStatusStyle.text,
                      }}
                    >
                      {booking.bookingStatus}
                    </span>
                  </div>
                </div>

                <div style={{ height: 1, background: '#ebebeb', margin: '16px 0' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f7f7f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={18} color="#484848" />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#717171', marginBottom: 2 }}>Guests</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>{booking.guestCount}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f7f7f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IndianRupee size={18} color="#484848" />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#717171', marginBottom: 2 }}>Total Amount</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>₹{booking.totalAmount}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f7f7f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IndianRupee size={18} color="#ff385c" />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#717171', marginBottom: 2 }}>Advance Paid</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>₹{booking.advanceAmount}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: paymentStatusStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 'bold', color: paymentStatusStyle.text }}>PAY</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#717171', marginBottom: 2 }}>Payment</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: paymentStatusStyle.text }}>{booking.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 16 }}>
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1px solid #ebebeb',
                  background: page === 1 ? '#f7f7f9' : '#fff',
                  color: page === 1 ? '#b0b0b0' : '#222',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <ChevronLeft size={20} />
              </button>
              
              <span style={{ fontSize: 14, fontWeight: 500, color: '#222' }}>
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1px solid #ebebeb',
                  background: page === totalPages ? '#f7f7f9' : '#fff',
                  color: page === totalPages ? '#b0b0b0' : '#222',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
