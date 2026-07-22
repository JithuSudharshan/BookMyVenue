import { Eye, EyeOff, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { getAdminVenues, updateVenueVisibility } from '../../api/admin-api/adminApi';
import { formatDate } from '../../utils/formatters';

function VenueManagement() {
  const [venues, setVenues] = useState([]);
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;
  const [pendingAction, setPendingAction] = useState(null);

  const handleConfirm = async () => {
    try {
      const isDeactivate = pendingAction.type === 'deactivate';
      await updateVenueVisibility(pendingAction.venue._id, isDeactivate ? 'inactive' : 'active');
      setToast({ type: 'success', message: `Venue ${isDeactivate ? 'deactivated' : 'activated'} successfully.` });
      setPendingAction(null);
      await loadVenues();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const loadVenues = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (statusFilter !== 'All') {
        params.status = statusFilter.toLowerCase();
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      const res = await getAdminVenues(params);
      setVenues(res.data || []);
      setTotalItems(res.pagination?.totalItems || 0);
      setTotalPages(res.pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(query);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    loadVenues();
  }, [currentPage, statusFilter, debouncedSearch]);

  return (
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <span className="page-kicker">Venue Management</span>
          <h1>Venue Directory</h1>
          <p>Review and manage all venue submissions.</p>
        </div>
      </div>

      <section className="table-card">
        <div className="table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search by venue name or city..."
          />
          <div className="segmented-control">
            <button
              className={statusFilter === 'All' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('All')}
            >
              All Venues
            </button>
            <button
              className={statusFilter === 'under_review' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('under_review')}
            >
              Under Review
            </button>
            <button
              className={statusFilter === 'Approved' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('Approved')}
            >
              Approved
            </button>
            <button
              className={statusFilter === 'Rejected' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('Rejected')}
            >
              Rejected
            </button>
          </div>
        </div>

        {loading ? <StateBlock title="Loading venues" message="Fetching venue listings." /> : null}
        {error ? <StateBlock title="Unable to load venues" message={error} /> : null}
        {!loading && !error ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Venue Name</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Price</th>
                  <th>Approval Status</th>
                  <th>Visibility</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => (
                  <tr key={venue._id}>
                    <td>
                      <strong>{venue.name}</strong>
                    </td>
                    <td>
                      {venue.location?.city ? `${venue.location.city}, ${venue.location.state || ''}`.trim().replace(/,$/, '') : 'Not specified'}
                    </td>
                    <td>{venue.capacity || 'N/A'}</td>
                    <td>{venue.price != null ? `₹${venue.price.toLocaleString()}` : 'N/A'}</td>
                    <td>
                      <StatusBadge status={venue.approval?.status} />
                    </td>
                    <td>
                      <StatusBadge status={venue.venueStatus || 'inactive'} />
                    </td>
                    <td>{formatDate(venue.approval?.submittedAt || venue.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/admin/venues/${venue._id}`}
                          className="icon-text-button secondary-button"
                          style={{ textDecoration: 'none' }}
                        >
                          <Eye size={15} />
                          <span>View</span>
                        </Link>
                        {venue.approval?.status === 'approved' && (
                          <button
                            className={venue.venueStatus === 'active' ? 'icon-text-button danger' : 'icon-text-button approve'}
                            type="button"
                            onClick={() => setPendingAction({ type: venue.venueStatus === 'active' ? 'deactivate' : 'activate', venue })}
                          >
                            {venue.venueStatus === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!venues.length ? <StateBlock title="No venues found" message="Try a different search or filter." /> : null}
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        ) : null}
      </section>

      {pendingAction ? (
        <ConfirmModal
          title={pendingAction.type === 'deactivate' ? 'Deactivate venue?' : 'Activate venue?'}
          message={`Are you sure you want to ${pendingAction.type === 'deactivate' ? 'deactivate' : 'activate'} "${pendingAction.venue.name}"?`}
          confirmLabel={pendingAction.type === 'deactivate' ? 'Deactivate' : 'Activate'}
          danger={pendingAction.type === 'deactivate'}
          onCancel={() => setPendingAction(null)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </div>
  );
}

export default VenueManagement;
