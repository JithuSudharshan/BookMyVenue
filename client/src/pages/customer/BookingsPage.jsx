import React, { useEffect, useState, useMemo } from 'react';
import { 
  CalendarDays, MapPin, Users, IndianRupee, 
  Clock, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, FileText, Calendar, MessageSquare, Star, Ban
} from 'lucide-react';
import { getCustomerBookings, cancelCustomerBooking } from "../../api/user-api/bookingApi";
import ReviewForm from '../../components/common/ReviewForm';
import ReviewDetailsModal from '../../components/common/ReviewDetailsModal';
import BaseBookingCard from '../../components/common/bookings/BaseBookingCard';
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

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking? The refund will be credited to your wallet instantly.")) {
      try {
        setLoading(true);
        await cancelCustomerBooking(bookingId, "Customer requested cancellation");
        fetchBookings(page, filter);
      } catch (err) {
        alert(err.message || "Failed to cancel booking");
        setLoading(false);
      }
    }
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

      {/* Filters - Always show if they have bookings, or if they have an active filter that returned 0 results */}
      {(totalBookingsCount > 0 || filter !== 'All') && (
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
            const venue = booking.venue || {};

            const customerActions = (
              <>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all" onClick={() => {}}>
                  <MessageSquare size={14} /> Contact Venue
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all" onClick={() => {}}>
                  <FileText size={14} /> Receipt
                </button>
                
                {['pending', 'confirmed'].includes(booking.bookingStatus?.toLowerCase()) && (
                  <button 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    <Ban size={14} /> Cancel Booking
                  </button>
                )}
                
                {booking.bookingStatus === 'Completed' && (
                  booking.review ? (
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 rounded-xl transition-all"
                      onClick={() => setViewReviewTarget({ bookingId: booking._id, venueId: venue._id || venue.id, review: booking.review })}
                    >
                      <Star size={14} className="fill-amber-400" /> View Review
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-primary hover:bg-primary/90 border border-transparent rounded-xl transition-all shadow-sm"
                      onClick={() => setReviewTarget({ bookingId: booking._id, venueId: venue._id || venue.id })}
                    >
                      <Star size={14} /> Write a Review
                    </button>
                  )
                )}
              </>
            );

            return (
              <BaseBookingCard
                key={booking._id}
                booking={booking}
                footerActions={customerActions}
              />
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

