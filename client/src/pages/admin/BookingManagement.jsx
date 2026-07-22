import { Eye, Calendar, Building2, Users, Receipt, Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import MetricCard from '../../components/admin/MetricCard';
import { getBookings, getBookingStats } from '../../api/admin-api/adminApi';
import { formatDate } from '../../utils/formatters';

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);

  // Filter states
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [date, setDate] = useState('');

  // Page states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(query);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load Bookings list
  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter !== 'All') {
        params.bookingStatus = statusFilter;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (date) {
        params.date = date;
      }

      const res = await getBookings(params);
      setBookings(res.data || []);
      setTotalItems(res.pagination?.totalItems || 0);
      setTotalPages(res.pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load booking stats
  const loadStats = async () => {
    try {
      const statsRes = await getBookingStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Trigger loads when criteria changes
  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter, debouncedSearch, date]);

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Booking Monitoring</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Bookings Directory</h1>
          <p className="block text-muted text-[12px] mt-1">Monitor status, transactions, and overview details of all platform bookings.</p>
        </div>
      </div>

      {stats && (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          <MetricCard
            title="Total Bookings"
            value={stats.totalBookings || 0}
            icon={Receipt}
            tone="blue"
          />
          <MetricCard
            title="Pending"
            value={stats.Pending || 0}
            icon={Landmark}
            tone="amber"
          />
          <MetricCard
            title="Confirmed"
            value={stats.Confirmed || 0}
            icon={Calendar}
            tone="green"
          />
          <MetricCard
            title="Completed"
            value={stats.Completed || 0}
            icon={Users}
            tone="violet"
          />
          <MetricCard
            title="Cancelled"
            value={stats.Cancelled || 0}
            icon={Building2}
            tone="red"
          />
        </section>
      )}

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col gap-3 mb-[18px]">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Search by Booking ID, Customer, or Venue..."
            />

            <div className="flex flex-wrap gap-1.5">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                    statusFilter === status 
                      ? 'text-white bg-admin-red border-admin-red' 
                      : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
                  }`}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                >
                  {status === 'All' ? 'All Bookings' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[38px] px-3 rounded-[7px] border border-line bg-white text-[13px] text-ink outline-none cursor-pointer hover:border-admin-red transition-colors"
                aria-label="Filter by date"
              />
              {date && (
                <button
                  onClick={() => {
                    setDate('');
                    setCurrentPage(1);
                  }}
                  className="min-h-[38px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all"
                  type="button"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? <StateBlock title="Loading bookings" message="Fetching platforms reservations." /> : null}
        {error ? <StateBlock title="Unable to load bookings" message={error} /> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Booking ID</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Customer</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Venue</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider"> Date</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Booking Status</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Payment Status</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-panel transition-colors border-b border-line">
                    <td className="p-[16px_12px] text-sm font-bold text-ink">
                      {booking._id.substring(0, 8)}...
                    </td>
                    <td className="p-[16px_12px] text-sm text-ink">
                      <div className="font-semibold">{booking.userId?.profile?.firstName ? `${booking.userId.profile.firstName} ${booking.userId.profile.lastName || ''}` : 'N/A'}</div>
                      <span className="text-[11px] text-muted block mt-0.5">{booking.userId?.email || 'N/A'}</span>
                    </td>
                    <td className="p-[16px_12px] text-sm text-ink">{booking.venueId?.name || 'N/A'}</td>
                    <td className="p-[16px_12px] text-sm text-ink">{formatDate(booking.bookingDate)}</td>
                    <td className="p-[16px_12px]">
                      <StatusBadge status={booking.bookingStatus} />
                    </td>
                    <td className="p-[16px_12px]">
                      <StatusBadge status={booking.paymentStatus} />
                    </td>
                    <td className="p-[16px_12px]">
                      <button
                        onClick={() => navigate(`/admin/bookings/${booking._id}`)}
                        className="inline-flex items-center justify-center p-1.5 w-8 h-8 rounded-md text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all"
                        type="button"
                        title="View Details"
                        aria-label="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!bookings.length ? <StateBlock title="No bookings found" message="Try a different search or filter criteria." /> : null}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : null}
      </section>

    </div>
  );
}

export default BookingManagement;
