import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getVendorBookings, getVendorBookingStats, getVendorVenueList } from '../../api/vendor-api/vendorApi';

import BookingStatsCards from '../../components/vendor/bookings/BookingStatsCards';
import BookingFilters from '../../components/vendor/bookings/BookingFilters';
import BookingTabs from '../../components/vendor/bookings/BookingTabs';
import BookingCard from '../../components/vendor/bookings/BookingCard';
import BookingDetailsDrawer from '../../components/vendor/bookings/BookingDetailsDrawer';

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
            <BookingCard 
              key={booking._id} 
              booking={booking} 
              onViewDetails={openDrawer} 
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
      <BookingDetailsDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        booking={selectedBooking} 
      />
    </div>
  );
};

export default VendorBookingsPage;
