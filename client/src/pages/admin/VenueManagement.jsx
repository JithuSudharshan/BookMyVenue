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
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Venue Management</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Venue Directory</h1>
          <p className="block text-muted text-[12px] mt-1">Review and manage all venue submissions.</p>
        </div>
      </div>

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-[18px] justify-between">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search by venue name or city..."
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'All'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('All')}
            >
              All Venues
            </button>
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'under_review'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('under_review')}
            >
              Under Review
            </button>
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'Approved'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('Approved')}
            >
              Approved
            </button>
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'Rejected'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Venue Name</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Location</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Capacity</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Price</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Approval Status</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Visibility</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Submitted</th>
                  <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => (
                  <tr key={venue._id} className="hover:bg-panel transition-colors border-b border-line">
                    <td className="p-[16px_12px] text-sm text-ink font-bold">
                      {venue.name}
                    </td>
                    <td className="p-[16px_12px] text-sm text-ink">
                      {venue.location?.city ? `${venue.location.city}, ${venue.location.state || ''}`.trim().replace(/,$/, '') : 'Not specified'}
                    </td>
                    <td className="p-[16px_12px] text-sm text-ink">{venue.capacity || 'N/A'}</td>
                    <td className="p-[16px_12px] text-sm text-ink">{venue.price != null ? `₹${venue.price.toLocaleString()}` : 'N/A'}</td>
                    <td className="p-[16px_12px]">
                      <StatusBadge status={venue.approval?.status} />
                    </td>
                    <td className="p-[16px_12px]">
                      <StatusBadge status={venue.venueStatus || 'inactive'} />
                    </td>
                    <td className="p-[16px_12px] text-sm text-ink">{formatDate(venue.approval?.submittedAt || venue.createdAt)}</td>
                    <td className="p-[16px_12px]">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/venues/${venue._id}`}
                          className="min-h-[32px] px-3 rounded-[7px] text-[12px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye size={15} />
                          <span>View</span>
                        </Link>
                        {venue.approval?.status === 'approved' && (
                          <button
                            className={`inline-flex items-center justify-center p-1.5 w-8 h-8 rounded-md bg-white border transition-all ${
                              venue.venueStatus === 'active' 
                                ? 'text-admin-red border-line hover:border-[#fecaca] hover:bg-admin-red-soft' 
                                : 'text-[#047857] border-line hover:border-green-200 hover:bg-green-50'
                            }`}
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
