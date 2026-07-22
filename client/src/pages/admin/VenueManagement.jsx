import { CalendarCheck, Clock, ShieldCheck, XCircle, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import MetricCard from '../../components/admin/MetricCard';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { getAdminVenues, updateVenueVisibility, getDashboardStats } from '../../api/admin-api/adminApi';
import { formatDate } from '../../utils/formatters';

function VenueManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state synced with URL: 'all' or 'approval'
  const activeTab = searchParams.get('tab') === 'approval' ? 'approval' : 'all';

  // Common UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [stats, setStats] = useState(null);

  // Tab 1: All Venues state
  const [venues, setVenues] = useState([]);
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('All'); // All, Active, Inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Tab 2: Pending Approval state
  const [pendingVenues, setPendingVenues] = useState([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotalItems, setPendingTotalItems] = useState(0);

  const itemsPerPage = 5;

  // Load Dashboard Statistics (metrics)
  const loadStats = async () => {
    try {
      const statsRes = await getDashboardStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Load Tab 1: All Venues
  const loadAllVenues = async () => {
    if (activeTab !== 'all') return;
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (visibilityFilter !== 'All') {
        params.visibility = visibilityFilter;
      }
      const res = await getAdminVenues(params);
      setVenues(res.data || []);
      setTotalItems(res.pagination?.totalItems || 0);
      setTotalPages(res.pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch venue directory.');
    } finally {
      setLoading(false);
    }
  };

  // Load Tab 2: Pending Approval
  const loadPendingVenues = async () => {
    if (activeTab !== 'approval') return;
    setLoading(true);
    try {
      const params = {
        page: pendingPage,
        limit: itemsPerPage,
        status: 'under_review', // gets both submitted and under_review from backend repo
      };
      const res = await getAdminVenues(params);
      setPendingVenues(res.data || []);
      setPendingTotalItems(res.pagination?.totalItems || 0);
      setPendingTotalPages(res.pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch pending applications.');
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

  // Load metrics on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Reload lists when filter / page / search changes
  useEffect(() => {
    if (activeTab === 'all') {
      loadAllVenues();
    } else {
      loadPendingVenues();
    }
  }, [activeTab, currentPage, pendingPage, debouncedSearch, visibilityFilter]);

  // Handle Tab Switch
  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setQuery('');
    setDebouncedSearch('');
    setVisibilityFilter('All');
    setError('');
  };

  // Handle Visibility updates
  const handleConfirm = async () => {
    try {
      const isDeactivate = pendingAction.type === 'deactivate';
      await updateVenueVisibility(pendingAction.venue._id, isDeactivate ? 'inactive' : 'active');
      setToast({ type: 'success', message: `Venue ${isDeactivate ? 'deactivated' : 'activated'} successfully.` });
      setPendingAction(null);
      
      // Reload statistics and current active tab
      await loadStats();
      if (activeTab === 'all') {
        await loadAllVenues();
      } else {
        await loadPendingVenues();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Action failed.' });
    }
  };

  const pendingCount = stats?.pendingApprovalVenues || 0;
  const totalCount = stats?.totalVenues || 0;
  const approvedCount = stats?.approvedVenues || 0;
  const rejectedCount = stats?.rejectedVenues || 0;

  return (
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Venue Directory</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Venue Management</h1>
          <p className="block text-muted text-[12px] mt-1">Review and manage registered venue listings, visibility, and incoming partner approvals.</p>
        </div>
      </div>

      {/* Metric Cards Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Total Venues" value={totalCount} icon={CalendarCheck} tone="blue" />
        <MetricCard title="Pending Approval" value={pendingCount} icon={Clock} tone="amber" />
        <MetricCard title="Approved Venues" value={approvedCount} icon={ShieldCheck} tone="green" />
        <MetricCard title="Rejected Venues" value={rejectedCount} icon={XCircle} tone="red" />
      </section>

      {/* Main Table Card */}
      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        
        {/* Tab Controls Bar */}
        <div className="flex border-b border-line mb-5">
          <button
            onClick={() => handleTabChange('all')}
            className={`min-h-[46px] px-6 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-admin-red text-admin-red'
                : 'border-transparent text-muted hover:text-ink'
            }`}
            type="button"
          >
            All Venues
          </button>
          
          <button
            onClick={() => handleTabChange('approval')}
            className={`min-h-[46px] px-6 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'approval'
                ? 'border-admin-red text-admin-red'
                : 'border-transparent text-muted hover:text-ink'
            }`}
            type="button"
          >
            <span>Pending Approval</span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black bg-admin-red text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Toolbar - Dynamic per tab */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-[18px] justify-between">
          {activeTab === 'all' ? (
            <>
              <SearchBox
                value={query}
                onChange={setQuery}
                placeholder="Search by venue name or city..."
              />
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Active', 'Inactive'].map((status) => (
                  <button
                    key={status}
                    className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                      visibilityFilter === status
                        ? 'text-white bg-admin-red border-admin-red'
                        : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
                    }`}
                    type="button"
                    onClick={() => {
                      setVisibilityFilter(status);
                      setCurrentPage(1);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted font-semibold">
              Venue listings awaiting admin verification and publication reviews.
            </div>
          )}
        </div>

        {/* Loader and error states */}
        {loading ? <StateBlock title={activeTab === 'all' ? "Loading venues" : "Loading submissions"} message="Fetching records from server." /> : null}
        {error ? <StateBlock title="Unable to retrieve data" message={error} /> : null}

        {/* Data Table */}
        {!loading && !error ? (
          <div className="overflow-x-auto">
            {activeTab === 'all' ? (
              // All Venues Table
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Venue Name</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Location</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Capacity</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Price</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Approval Status</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue) => {
                    const isApproved = venue.approval?.status === 'approved';
                    const isActive = venue.venueStatus === 'active';
                    return (
                      <tr key={venue._id} className="hover:bg-panel transition-colors border-b border-line">
                        <td className="p-[16px_12px] text-sm text-ink font-bold max-w-[200px] truncate" title={venue.name}>
                          {venue.name}
                        </td>
                        <td className="p-[16px_12px] text-sm text-ink">
                          {venue.location?.city ? `${venue.location.city}, ${venue.location.state || ''}`.trim().replace(/,$/, '') : 'Not specified'}
                        </td>
                        <td className="p-[16px_12px] text-sm text-ink">{venue.capacity || 'N/A'}</td>
                        <td className="p-[16px_12px] text-sm text-ink">{venue.price != null ? `₹${venue.price.toLocaleString()}` : 'N/A'}</td>
                        <td className="p-[16px_12px]">
                          <div className="flex gap-2">
                            <StatusBadge status={venue.approval?.status} />
                            {isApproved && (
                              <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
                            )}
                          </div>
                        </td>
                        <td className="p-[16px_12px]">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/venues/${venue._id}`}
                              className="min-h-[32px] px-3 rounded-[7px] text-[12px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all inline-flex items-center gap-1.5"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </Link>
                            {isApproved && (
                              <button
                                className={`inline-flex items-center gap-1.5 min-h-[32px] px-2.5 border rounded-[7px] text-[12px] font-extrabold bg-white transition-all ${
                                  isActive
                                    ? 'text-admin-red border-line hover:border-[#fecaca] hover:bg-admin-red-soft'
                                    : 'text-[#047857] border-line hover:border-green-200 hover:bg-green-50'
                                }`}
                                type="button"
                                onClick={() => setPendingAction({ type: isActive ? 'deactivate' : 'activate', venue })}
                              >
                                {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              // Pending Approval Table
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Venue Name</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Location</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Capacity</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Submitted Date</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Stage</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVenues.map((venue) => (
                    <tr key={venue._id} className="hover:bg-panel transition-colors border-b border-line">
                      <td className="p-[16px_12px] text-sm text-ink font-bold max-w-[200px] truncate" title={venue.name}>
                        {venue.name}
                      </td>
                      <td className="p-[16px_12px] text-sm text-ink">
                        {venue.location?.city ? `${venue.location.city}, ${venue.location.state || ''}`.trim().replace(/,$/, '') : 'Not specified'}
                      </td>
                      <td className="p-[16px_12px] text-sm text-ink">{venue.capacity || 'N/A'}</td>
                      <td className="p-[16px_12px] text-sm text-ink">
                        {formatDate(venue.approval?.submittedAt || venue.createdAt)}
                      </td>
                      <td className="p-[16px_12px]">
                        <StatusBadge status={venue.approval?.status} />
                      </td>
                      <td className="p-[16px_12px]">
                        <button
                          onClick={() => navigate(`/admin/venues/${venue._id}`)}
                          className="min-h-[32px] px-3.5 rounded-[7px] text-[12px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all inline-flex items-center gap-1.5"
                          type="button"
                        >
                          <Eye size={14} />
                          <span>Review Venue</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Empty States */}
            {activeTab === 'all' && !venues.length ? (
              <StateBlock title="No venues found" message="Try adjusting your filters or search keywords." />
            ) : null}
            {activeTab === 'approval' && !pendingVenues.length ? (
              <StateBlock title="No pending approvals" message="Excellent! All venue submissions have been processed." />
            ) : null}

            {/* Pagination Controls */}
            {activeTab === 'all' ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            ) : (
              <Pagination
                currentPage={pendingPage}
                totalPages={pendingTotalPages}
                totalItems={pendingTotalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setPendingPage}
              />
            )}
          </div>
        ) : null}
      </section>

      {/* Activate / Deactivate Confirm Modal */}
      {pendingAction ? (
        <ConfirmModal
          title={pendingAction.type === 'deactivate' ? 'Deactivate venue?' : 'Activate venue?'}
          message={`Are you sure you want to ${
            pendingAction.type === 'deactivate' ? 'deactivate' : 'activate'
          } visibility for "${pendingAction.venue.name}"?`}
          confirmLabel="Confirm"
          danger={pendingAction.type === 'deactivate'}
          onCancel={() => setPendingAction(null)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </div>
  );
}

export default VenueManagement;
