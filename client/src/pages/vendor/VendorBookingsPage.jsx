import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getVendorBookings, getVendorBookingStats, getVendorVenueList, cancelVendorBooking, requestBalancePayment, markBookingAsCompleted } from '../../api/vendor-api/vendorApi';

import BookingStatsCards from '../../components/vendor/bookings/BookingStatsCards';
import BookingFilters from '../../components/vendor/bookings/BookingFilters';
import BookingTabs from '../../components/vendor/bookings/BookingTabs';
import BaseBookingCard from '../../components/common/bookings/BaseBookingCard';
import { Eye, Phone, Mail, Lock, Download, XCircle, CheckCircle, Ban, ChevronLeft, HelpCircle } from 'lucide-react';
import BaseBookingDetailsDrawer from '../../components/common/bookings/BaseBookingDetailsDrawer';
import SlideToCancel from '../../components/common/bookings/SlideToCancel';

const VendorBookingsPage = () => {
  const [stats, setStats] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filters, setFilters] = useState({
    search: '',
    venueId: '',
    bookingMode: '',
  });

  // Drawer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('VENUE_UNAVAILABLE');

  // Debounced fetch
  const fetchBookings = useCallback(async (currentPage, currentTab, currentFilters) => {
    try {
      setLoading(true);
      const res = await getVendorBookings({
        page: currentPage,
        limit: 10,
        status: currentTab,
        venueId: currentFilters.venueId,
        bookingMode: currentFilters.bookingMode,
        search: currentFilters.search,
      });
      setBookings(res.bookings || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [statsData, venuesData] = await Promise.all([
        getVendorBookingStats(),
        getVendorVenueList()
      ]);
      setStats(statsData);
      setVenues(venuesData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings(page, activeTab, filters);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [page, activeTab, filters, fetchBookings]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openDrawer = (booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      const res = await cancelVendorBooking(bookingId, cancellationReason);
      if (res.success && res.data) {
        setBookings(prev => prev.map(b => b._id === bookingId ? res.data : b));
        setSelectedBooking(res.data);
        setIsCancelling(false);
        toast.success("Booking cancelled successfully.");
      } else {
        fetchBookings(page, activeTab, filters); // Fallback
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  const startCancellationFlow = () => {
    setIsCancelling(true);
    setCancellationReason('VENUE_UNAVAILABLE');
  };

  const handleRequestBalance = async (bookingId) => {
    try {
      setLoading(true);
      const res = await requestBalancePayment(bookingId);
      if (res.success) {
        toast.success("Balance payment requested successfully.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to request balance payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (bookingId) => {
    try {
      setLoading(true);
      const res = await markBookingAsCompleted(bookingId);
      if (res.success && res.data) {
        setBookings(prev => prev.map(b => b._id === bookingId ? res.data : b));
        setSelectedBooking(res.data);
        toast.success("Booking marked as completed.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to complete booking.");
    } finally {
      setLoading(false);
    }
  };

  const cancelCancellationFlow = () => {
    setIsCancelling(false);
  };

  // Vendor Specific Drawer Content
  const renderVendorDrawerInformation = (booking) => {
    if (!booking) return null;
    const customer = booking.customer || {};
    const showContact = customer.phone || customer.email;

    return (
      <section className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Customer Details
        </h3>
        
        {showContact ? (
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
              {customer.profileImage ? (
                <img src={customer.profileImage} alt={customer.fullName} className="w-full h-full object-cover" />
              ) : (
                customer.fullName?.charAt(0) || 'C'
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{customer.fullName || 'Unknown Customer'}</p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">Ref: {booking.bookingNumber}</p>
                </div>
              </div>
              
              <div className="mt-3 space-y-2 text-sm text-gray-700 bg-gray-50/40 rounded-lg p-3 border border-gray-50">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {customer.phone}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {customer.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
            <div className="p-2 bg-amber-100/50 rounded-full flex-shrink-0">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Locked until full payment</p>
              <p className="text-xs text-amber-700 mt-1">Contact details will unlock automatically once the customer completes their balance payment.</p>
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderVendorDrawerActions = (booking) => {
    if (!booking) return null;
    
    if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'refunded') {
      return (
        <button className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer w-full md:w-auto">
          <HelpCircle className="w-3.5 h-3.5" /> Support
        </button>
      );
    }
    
    return (
      <>
        <button disabled className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-500 bg-white border border-gray-200 rounded-lg cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm">
          <Phone className="w-3.5 h-3.5" /> Contact
        </button>
        <button disabled className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-gray-500 bg-white border border-gray-200 rounded-lg cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" /> Invoice
        </button>
        
        {['pending', 'confirmed'].includes(booking.bookingStatus?.toLowerCase()) ? (
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm cursor-pointer"
            onClick={startCancellationFlow}
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
        ) : (
          <button disabled className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-red-400 bg-white border border-red-100 rounded-lg cursor-not-allowed shadow-sm">
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
        )}

        {booking.paymentStatus === 'partial' && booking.pricing?.remainingAmount > 0 ? (
          <button 
            onClick={() => handleRequestBalance(booking._id)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-bold tracking-wide uppercase text-primary bg-white border border-primary rounded-lg hover:bg-primary/10 transition-colors shadow-sm"
          >
            Request Balance
          </button>
        ) : null}

        <button 
          disabled={booking.bookingStatus !== 'confirmed' || (booking.paymentStatus === 'partial')} 
          onClick={() => handleMarkCompleted(booking._id)}
          className={`flex items-center justify-center gap-2 px-5 py-2 text-[11px] font-bold tracking-wide uppercase text-white rounded-lg border border-transparent transition-colors shadow-sm ${booking.bookingStatus === 'confirmed' && booking.paymentStatus !== 'partial' ? 'bg-primary hover:bg-primary/90 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          <CheckCircle className="w-4 h-4" /> Mark Done
        </button>
      </>
    );
  };

  const renderCancellationView = () => {
    if (!selectedBooking) return null;
    return (
      <div className="flex flex-col h-full bg-red-50/30">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <button onClick={cancelCancellationFlow} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Cancel Booking</h2>
          <div className="w-9" />
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="bg-white border border-red-100 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Cancellation Summary</h3>
                <p className="text-xs text-gray-500">Ref: {selectedBooking.bookingNumber}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer Refund Amount</span>
                <span className="font-bold text-gray-900">₹{(selectedBooking.pricing?.totalAmount || 0) - (selectedBooking.pricing?.remainingAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Refund Destination</span>
                <span className="font-medium text-gray-900">Customer Wallet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Refund Status</span>
                <span className="font-medium text-green-600">Instant</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Reason for Cancellation</label>
            <select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm bg-white"
            >
              <option value="VENUE_UNAVAILABLE">Venue Unavailable</option>
              <option value="DOUBLE_BOOKED">Double Booked / Sync Error</option>
              <option value="MAINTENANCE">Emergency Maintenance</option>
              <option value="CUSTOMER_REQUEST">Customer Requested Offline</option>
              <option value="FORCE_MAJEURE">Force Majeure / Natural Disaster</option>
              <option value="OTHER">Other Reason</option>
            </select>
          </div>
          
          <div className="bg-red-50 text-red-800 p-4 rounded-xl text-xs leading-relaxed mb-6 border border-red-100">
            <strong>Warning:</strong> Vendor-initiated cancellations negatively impact your venue's reliability score. The customer will receive an instant 100% refund to their wallet.
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <SlideToCancel 
            onConfirm={() => handleCancelBooking(selectedBooking._id)}
            isLoading={loading}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Bookings</h1>
        <p className="text-gray-500 text-sm md:text-base">Manage reservations for all your venues.</p>
      </div>

      {/* KPI Cards */}
      <BookingStatsCards stats={stats} loading={!stats} />

      {/* Filters & Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-2">
        <BookingTabs activeTab={activeTab} onChange={handleTabChange} />
        <BookingFilters filters={filters} venues={venues} onChange={handleFilterChange} />
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {loading && bookings.length === 0 ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Bookings from your approved venues will appear here once customers start making reservations.
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <BaseBookingCard 
              key={booking._id} 
              booking={booking}
              extraInformation={
                <p className="text-xs text-gray-400 font-mono">#{booking.bookingNumber}</p>
              }
              footerActions={
                <button
                  onClick={() => openDrawer(booking)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-primary hover:text-white rounded-xl transition-all group-hover:bg-primary group-hover:text-white"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              }
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Drawer */}
      <BaseBookingDetailsDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        booking={selectedBooking} 
        roleSpecificInformation={renderVendorDrawerInformation(selectedBooking)}
        actionSlot={renderVendorDrawerActions(selectedBooking)}
        isCancelling={isCancelling}
        cancellationView={renderCancellationView()}
      />
    </div>
  );
};

export default VendorBookingsPage;
