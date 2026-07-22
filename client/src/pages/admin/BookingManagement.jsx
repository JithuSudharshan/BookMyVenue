import { Eye, Calendar, Building2, Users, Receipt, Landmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import MetricCard from '../../components/admin/MetricCard';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal';
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

  // Selected booking for Details Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

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
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="page-heading">
        <div>
          <span className="page-kicker">Booking Monitoring</span>
          <h1>Bookings Directory</h1>
          <p>Monitor status, transactions, and overview details of all platform bookings.</p>
        </div>
      </div>

      {stats && (
        <section className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
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

      <section className="table-card">
        <div className="table-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Search by Booking ID, Customer, or Venue..."
            />

            <div className="segmented-control">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  className={statusFilter === status ? 'active' : ''}
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

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {/* Single Date Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '7px',
                  border: '1px solid var(--line)',
                  background: '#fff',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Filter by date"
              />
              {date && (
                <button
                  onClick={() => {
                    setDate('');
                    setCurrentPage(1);
                  }}
                  className="secondary-button"
                  type="button"
                  style={{ minHeight: '38px', marginLeft: '6px' }}
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
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Venue</th>
                  <th> Date</th>
                  <th>Booking Status</th>
                  <th>Payment Status</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <strong>{booking._id.substring(0, 8)}...</strong>
                    </td>
                    <td>
                      <div>{booking.userId?.profile?.firstName ? `${booking.userId.profile.firstName} ${booking.userId.profile.lastName || ''}` : 'N/A'}</div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{booking.userId?.email || 'N/A'}</span>
                    </td>
                    <td>{booking.venueId?.name || 'N/A'}</td>
                    <td>{formatDate(booking.bookingDate)}</td>
                    <td>
                      <StatusBadge status={booking.bookingStatus} />
                    </td>
                    <td>
                      <StatusBadge status={booking.paymentStatus} />
                    </td>
                    <td>
                      <strong>₹{booking.totalAmount?.toLocaleString() || 0}</strong>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="secondary-button"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', width: '32px', height: '32px', borderRadius: '6px' }}
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

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

export default BookingManagement;
