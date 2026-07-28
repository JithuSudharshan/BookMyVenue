import React, { useEffect, useState, useMemo } from 'react';
import { 
  CalendarDays, MapPin, Users, IndianRupee, 
  Clock, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, FileText, Calendar, MessageSquare, Star, Ban,
  RotateCcw, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getCustomerBookings, cancelCustomerBooking } from "../../api/user-api/bookingApi";
import ReviewForm from '../../components/common/ReviewForm';
import ReviewDetailsModal from '../../components/common/ReviewDetailsModal';
import BaseBookingCard from '../../components/common/bookings/BaseBookingCard';
import BaseBookingDetailsDrawer from '../../components/common/bookings/BaseBookingDetailsDrawer';
import SlideToCancel from '../../components/common/bookings/SlideToCancel';
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
  
  // Cancellation UX State
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('Change of plans');

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
    try {
      setLoading(true);
      const res = await cancelCustomerBooking(bookingId, cancellationReason);
      if (res.success && res.data) {
        setBookings(prev => prev.map(b => b._id === bookingId ? res.data : b));
        setSelectedBooking(res.data);
        setIsCancelling(false);
        setFilter('cancelled');
      } else {
        fetchBookings(page, filter); // Fallback
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  const startCancellationFlow = () => {
    setIsCancelling(true);
    setCancellationReason('Change of plans');
  };

  const cancelCancellationFlow = () => {
    setIsCancelling(false);
  };

  const handleOpenDrawer = (booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedBooking(null);
      setIsCancelling(false);
    }, 300); // clear after animation
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

      {loading && bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="font-medium text-sm">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 && !error ? (
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
        <div className="bk-list relative">
          {/* Overlay loading spinner if changing filters while having data */}
          {loading && bookings.length > 0 && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          isCancelling={isCancelling}
          cancellationView={
            <div className="flex flex-col h-full space-y-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={cancelCancellationFlow}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h3 className="text-xl font-semibold text-gray-900">Cancel Booking</h3>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-5 space-y-3">
                <div className="flex items-start gap-3 text-red-800">
                  <Ban className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    You are about to cancel this booking. This action cannot be undone. 
                    The venue slots will be immediately released.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">Refund Breakdown</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Amount Paid</span>
                    <span className="font-medium">
                      ₹{((selectedBooking.pricing?.totalAmount || 0) - (selectedBooking.pricing?.remainingAmount || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Cancellation Fee</span>
                    <span className="font-medium text-green-600">- ₹0</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="font-semibold text-gray-900">Wallet Refund</span>
                    <span className="font-bold text-lg text-gray-900">
                      ₹{((selectedBooking.pricing?.totalAmount || 0) - (selectedBooking.pricing?.remainingAmount || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Reason for cancellation</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white cursor-pointer"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  disabled={loading}
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Found a better venue">Found a better venue</option>
                  <option value="Event postponed">Event postponed</option>
                  <option value="Accidental booking">Accidental booking</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mt-auto pt-8">
                <SlideToCancel 
                  onConfirm={() => handleCancelBooking(selectedBooking._id)}
                  isLoading={loading}
                />
              </div>
            </div>
          }
          actionSlot={
            selectedBooking.bookingStatus === 'cancelled' || selectedBooking.bookingStatus === 'refunded' ? (
              <>
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" /> Book Again
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5" /> Support
                </button>
                {selectedBooking.accessPolicy?.permissions?.canDownloadInvoice && (
                  <button className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                    <FileText className="w-3.5 h-3.5" /> Receipt
                  </button>
                )}
              </>
            ) : (
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
                    onClick={startCancellationFlow}
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
            )
          }
        />
      )}
    </div>
  );
}

export default BookingsPage;

