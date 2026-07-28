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
import BaseBookingDetailsDrawer from '../../components/common/bookings/BaseBookingDetailsDrawer';
import CustomerDrawerInfo from '../../components/customer/bookings/CustomerDrawerInfo';
import BookingTabs from '../../components/vendor/bookings/BookingTabs';
import BookingFilters from '../../components/vendor/bookings/BookingFilters';
import './BookingsPage.css';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  
  const [filter, setFilter] = useState('upcoming');
  const [searchFilters, setSearchFilters] = useState({ search: '', bookingMode: '' });

  // Review form & details state
  const [reviewTarget, setReviewTarget] = useState(null); // { bookingId, venueId, existingReview }
  const [viewReviewTarget, setViewReviewTarget] = useState(null); // { bookingId, venueId, review }

  // Drawer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const limit = 5;

  useEffect(() => {
    // Only debounce if there is a search term being typed, otherwise fetch immediately
    const handler = setTimeout(() => {
      fetchBookings(page, filter, searchFilters.search, searchFilters.bookingMode);
    }, searchFilters.search ? 500 : 0);

    return () => clearTimeout(handler);
  }, [page, filter, searchFilters.search, searchFilters.bookingMode]);

  const fetchBookings = async (currentPage, currentFilter, currentSearch, currentBookingMode) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerBookings(currentPage, limit, currentFilter, currentSearch, currentBookingMode);
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

  const handleSearchFilterChange = (updates) => {
    setSearchFilters(prev => ({ ...prev, ...updates }));
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

  const handleOpenDrawer = (booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedBooking(null), 300); // clear after animation
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

      {/* Filters & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-2">
        <BookingTabs activeTab={filter} onChange={handleFilterChange} />
        <BookingFilters filters={searchFilters} venues={[]} onChange={handleSearchFilterChange} />
      </div>

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
              <button
                onClick={() => handleOpenDrawer(booking)}
                className="flex items-center gap-1.5 px-4 py-2 text-[11px] sm:text-xs font-semibold text-white bg-primary hover:bg-primary/90 border border-transparent rounded-xl transition-all shadow-sm"
              >
                <CalendarDays size={14} /> View Details
              </button>
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

      {/* Drawer */}
      {selectedBooking && (
        <BaseBookingDetailsDrawer
          isOpen={drawerOpen}
          onClose={handleCloseDrawer}
          booking={selectedBooking}
          isCustomerPortal={true}
          roleSpecificInformation={<CustomerDrawerInfo booking={selectedBooking} />}
          actionSlot={
            <>
              {selectedBooking.accessPolicy?.permissions?.canContactVendor ? (
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5" /> Contact
                </button>
              ) : (
                <button disabled className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-400 bg-gray-50 border border-gray-100 rounded-lg cursor-not-allowed shadow-sm">
                  <MessageSquare className="w-3.5 h-3.5" /> Contact
                </button>
              )}
              
              {selectedBooking.accessPolicy?.permissions?.canDownloadInvoice ? (
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                  <FileText className="w-3.5 h-3.5" /> Receipt
                </button>
              ) : (
                <button disabled className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-400 bg-gray-50 border border-gray-100 rounded-lg cursor-not-allowed shadow-sm">
                  <FileText className="w-3.5 h-3.5" /> Receipt
                </button>
              )}
              
              {selectedBooking.accessPolicy?.permissions?.canCancel && (
                <button 
                  className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm cursor-pointer"
                  onClick={() => {
                    handleCloseDrawer();
                    handleCancelBooking(selectedBooking._id);
                  }}
                >
                  <Ban className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
              
              {selectedBooking.accessPolicy?.permissions?.canReview && (
                selectedBooking.review ? (
                  <button
                    className="flex items-center justify-center gap-2 px-5 py-2 text-[11px] font-bold tracking-wide uppercase text-amber-700 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-sm cursor-pointer"
                    onClick={() => setViewReviewTarget({ bookingId: selectedBooking._id, venueId: selectedBooking.venue?._id || selectedBooking.venue?.id, review: selectedBooking.review })}
                  >
                    <Star size={14} className="fill-amber-400 text-amber-400" /> View Review
                  </button>
                ) : (
                  <button
                    className="flex items-center justify-center gap-2 px-5 py-2 text-[11px] font-bold tracking-wide uppercase text-white bg-primary rounded-lg border border-transparent cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                    onClick={() => setReviewTarget({ bookingId: selectedBooking._id, venueId: selectedBooking.venue?._id || selectedBooking.venue?.id })}
                  >
                    <Star size={14} /> Write Review
                  </button>
                )
              )}
            </>
          }
        />
      )}
    </div>
  );
}

export default BookingsPage;

