import React, { useEffect, useState, useMemo } from 'react';
import { 
  CalendarDays, MapPin, Users, IndianRupee, 
  Clock, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, FileText, Calendar, MessageSquare, Star
} from 'lucide-react';
import { getCustomerBookings } from "../../api/user-api/bookingApi";
import ReviewForm from '../../components/common/ReviewForm';
import ReviewDetailsModal from '../../components/common/ReviewDetailsModal';
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

  // Review form & details state
  const [reviewTarget, setReviewTarget] = useState(null); // { bookingId, venueId, existingReview }
  const [viewReviewTarget, setViewReviewTarget] = useState(null); // { bookingId, venueId, review }

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
        return { bg: 'bg-success/10', text: 'text-success' };
      case 'pending':
        return { bg: 'bg-warning/10', text: 'text-warning' };
      case 'cancelled':
        return { bg: 'bg-error-container', text: 'text-error' };
      case 'refunded':
        return { bg: 'bg-info/10', text: 'text-info' };
      default:
        return { bg: 'bg-surface-container', text: 'text-on-surface-variant' };
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
      <div className="bk-page flex flex-col items-center pt-20">
        <p className="text-on-surface-variant font-body-md">Loading bookings...</p>
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
        <div className="p-4 bg-error-container text-on-error-container rounded-lg mb-6">
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
          <a href="/" className="bk-btn bk-btn-primary" style={{ marginTop: 20, textDecoration: 'none' }}>
            Explore Venues
          </a>
        </div>
      ) : (
        <div className="bk-list">
          {bookings.length === 0 && !loading && (
            <div className="p-10 text-center text-on-surface-variant">
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
                      <div className="bk-card-no-img w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                        <Calendar size={32} />
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
                          <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Booking</span>
                          <span className={`bk-badge ${bookingStatusStyle.bg} ${bookingStatusStyle.text}`}>
                            {getStatusIcon(booking.bookingStatus)} {booking.bookingStatus}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Payment</span>
                          <span className={`bk-badge ${paymentStatusStyle.bg} ${paymentStatusStyle.text}`}>
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
                  <button className="bk-btn bk-btn-outline" onClick={() => {}}>
                    <MessageSquare size={16} /> Contact Venue
                  </button>
                  <button className="bk-btn bk-btn-outline" onClick={() => {}}>
                    <FileText size={16} /> Receipt
                  </button>
                  {booking.bookingStatus === 'Completed' && (
                    booking.review ? (
                      <button
                        className="bk-btn bk-btn-outline border-primary text-primary font-semibold"
                        onClick={() => setViewReviewTarget({ bookingId: booking._id, venueId: venue._id || venue.id, review: booking.review })}
                      >
                        <Star size={16} className="fill-amber-400 text-amber-400" /> View Review
                      </button>
                    ) : (
                      <button
                        className="bk-btn bk-btn-primary"
                        onClick={() => setReviewTarget({ bookingId: booking._id, venueId: venue._id || venue.id })}
                      >
                        <Star size={16} /> Write a Review
                      </button>
                    )
                  )}
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

      {/* Review Form Modal (for submit and edit) */}
      {reviewTarget && (
        <ReviewForm
          isOpen={Boolean(reviewTarget)}
          onClose={() => setReviewTarget(null)}
          bookingId={reviewTarget.bookingId}
          venueId={reviewTarget.venueId}
          existingReview={reviewTarget.existingReview || null}
          onSuccess={() => {
            setReviewTarget(null);
            fetchBookings(page, filter);
          }}
        />
      )}

      {/* View Review Modal */}
      {viewReviewTarget && (
        <ReviewDetailsModal
          isOpen={Boolean(viewReviewTarget)}
          onClose={() => setViewReviewTarget(null)}
          review={viewReviewTarget.review}
          onEdit={(review) => {
            setViewReviewTarget(null);
            setReviewTarget({
              bookingId: viewReviewTarget.bookingId,
              venueId: viewReviewTarget.venueId,
              existingReview: review,
            });
          }}
          onDeleteSuccess={() => {
            setViewReviewTarget(null);
            fetchBookings(page, filter);
          }}
        />
      )}
    </div>
  );
}

export default BookingsPage;

