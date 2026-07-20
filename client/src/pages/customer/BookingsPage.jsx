import React, { useEffect, useState, useMemo } from 'react';
import { 
  CalendarDays, MapPin, Users, IndianRupee, 
  Clock, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, FileText, Calendar, MessageSquare, Image as ImageIcon
} from 'lucide-react';
import { getCustomerBookings } from "../../api/user-api/bookingApi";
import './BookingsPage.css';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  
  // Local UI state for filtering
  const [filter, setFilter] = useState('All');

  const limit = 5;

  useEffect(() => {
    fetchBookings(page, filter);
  }, [page, filter]);

  const fetchBookings = async (currentPage, currentFilter) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerBookings(currentPage, limit, currentFilter);
      if (res.success) {
        setBookings(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalBookingsCount(res.pagination?.total || 0);
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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle size={14} />;
      case 'pending':
        return <Clock size={14} />;
      case 'cancelled':
      case 'refunded':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="bk-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: '#717171' }}>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="bk-page">
      <div className="bk-header">
        <h1 className="bk-title">My Bookings</h1>
        <p className="bk-subtitle">View and manage all your venue bookings in one place.</p>
      </div>



      {error && (
        <div style={{ padding: 16, background: '#fce8e6', color: '#d93025', borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {/* Filters */}
      {totalBookingsCount > 0 && (
        <div className="bk-filters">
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map(f => (
            <button 
              key={f}
              className={`bk-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => handleFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {bookings.length === 0 && !loading && !error ? (
        <div className="bk-empty">
          <div className="bk-empty-icon">
            <CalendarDays size={32} />
          </div>
          <h2 className="bk-empty-title">No bookings yet</h2>
          <p className="bk-empty-subtitle">
            You haven't booked any venues yet. Explore venues and make your first booking!
          </p>
          <a href="/home" className="bk-btn bk-btn-primary" style={{ marginTop: 20, textDecoration: 'none' }}>
            Explore Venues
          </a>
        </div>
      ) : (
        <div className="bk-list">
          {bookings.length === 0 && !loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#717171' }}>
              No bookings found for the selected filter.
            </div>
          )}
          
          {bookings.map((booking) => {
            const bookingStatusStyle = getStatusBadgeColor(booking.bookingStatus);
            const paymentStatusStyle = getStatusBadgeColor(booking.paymentStatus);
            const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            });
            const venue = booking.venueId || {};
            const venueName = venue.name || 'Unknown Venue';
            const location = venue.location ? `${venue.location.city}, ${venue.location.state}` : '';
            const image = (venue.images && venue.images.length > 0) ? venue.images[0] : null;

            return (
              <div key={booking._id} className="bk-card">
                <div className="bk-card-main">
                  {/* Venue Image */}
                  <div className="bk-card-img-wrap">
                    {image ? (
                      <img src={image} alt={venueName} className="bk-card-img" />
                    ) : (
                      <div className="bk-card-no-img" style={{ width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0' }}>
                        <ImageIcon size={32} />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="bk-card-content">
                    <div className="bk-card-header">
                      <div>
                        <h3 className="bk-venue-name">{venueName}</h3>
                        {location && (
                          <div className="bk-venue-loc">
                            <MapPin size={14} />
                            {location}
                          </div>
                        )}
                      </div>
                      <div className="bk-badges" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#717171', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Booking</span>
                          <span className="bk-badge" style={{ background: bookingStatusStyle.bg, color: bookingStatusStyle.text }}>
                            {getStatusIcon(booking.bookingStatus)} {booking.bookingStatus}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#717171', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</span>
                          <span className="bk-badge" style={{ background: paymentStatusStyle.bg, color: paymentStatusStyle.text }}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bk-info-grid">
                      <div className="bk-info-chip">
                        <div className="bk-info-icon"><CalendarDays size={18} /></div>
                        <div className="bk-info-text">
                          <span className="bk-info-label">Date</span>
                          <span className="bk-info-val">{bookingDate}</span>
                        </div>
                      </div>
                      
                      {booking.slotIds && booking.slotIds.length > 0 && (
                        <div className="bk-info-chip">
                          <div className="bk-info-icon"><Clock size={18} /></div>
                          <div className="bk-info-text">
                            <span className="bk-info-label">Slots</span>
                            <span className="bk-info-val">{booking.slotIds.length} Slot(s)</span>
                          </div>
                        </div>
                      )}

                      <div className="bk-info-chip">
                        <div className="bk-info-icon"><Users size={18} /></div>
                        <div className="bk-info-text">
                          <span className="bk-info-label">Guests</span>
                          <span className="bk-info-val">{booking.guestCount}</span>
                        </div>
                      </div>

                      <div className="bk-info-chip">
                        <div className="bk-info-icon"><IndianRupee size={18} /></div>
                        <div className="bk-info-text">
                          <span className="bk-info-label">Total Amount</span>
                          <span className="bk-info-val">₹{booking.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bk-card-footer">
                  <button className="bk-btn bk-btn-outline" onClick={() => console.log('Contact Venue')}>
                    <MessageSquare size={16} /> Contact Venue
                  </button>
                  <button className="bk-btn bk-btn-outline" onClick={() => console.log('Download Receipt')}>
                    <FileText size={16} /> Receipt
                  </button>
                  <button className="bk-btn bk-btn-primary" onClick={() => console.log('View Details')}>
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bk-pagination">
          <button className="bk-page-btn" onClick={handlePrevPage} disabled={page === 1}>
            <ChevronLeft size={20} />
          </button>
          <span className="bk-page-text">
            Page {page} of {totalPages}
          </span>
          <button className="bk-page-btn" onClick={handleNextPage} disabled={page === totalPages}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
