import { Building2, ShieldCheck, ShieldOff, Eye, UserX, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import MetricCard from '../../components/admin/MetricCard';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { updateUserBlockStatus, getVendors, getDashboardStats } from '../../api/admin-api/adminApi';
import { formatDate, vendorEmail, vendorUserId } from '../../utils/formatters';

function VendorManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab state synced with URL
  const activeTab = searchParams.get('tab') === 'review' ? 'review' : 'all';

  // Common UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [stats, setStats] = useState(null);

  // Tab 1: All Vendors state
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Suspended
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Tab 2: Pending Review state
  const [pendingVendors, setPendingVendors] = useState([]);
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

  // Load Tab 1: All Vendors
  const loadAllVendors = async () => {
    if (activeTab !== 'all') return;
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch.trim(),
      };
      if (statusFilter !== 'All') {
        params.accountStatus = statusFilter;
      }
      const res = await getVendors(params);
      setVendors(res.data || []);
      setTotalItems(res.pagination?.totalItems || 0);
      setTotalPages(res.pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch vendor directory.');
    } finally {
      setLoading(false);
    }
  };

  // Load Tab 2: Pending Review Applications
  const loadPendingVendors = async () => {
    if (activeTab !== 'review') return;
    setLoading(true);
    try {
      const params = {
        page: pendingPage,
        limit: itemsPerPage,
        status: 'Pending',
      };
      const res = await getVendors(params);
      setPendingVendors(res.data || []);
      setPendingTotalItems(res.pagination?.totalItems || 0);
      setPendingTotalPages(res.pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch pending applications.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query for Tab 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(query);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load metrics once on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Reload lists when active filters or pages change
  useEffect(() => {
    if (activeTab === 'all') {
      loadAllVendors();
    } else {
      loadPendingVendors();
    }
  }, [activeTab, currentPage, pendingPage, debouncedSearch, statusFilter]);

  // Reset states on tab switch
  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setQuery('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setError('');
  };

  // Handle User Suspend/Restore Actions
  const handleConfirm = async () => {
    try {
      const isBlock = pendingAction.type === 'block';
      await updateUserBlockStatus(vendorUserId(pendingAction.vendor), isBlock);
      
      setToast({ 
        type: 'success', 
        message: `Vendor ${isBlock ? 'suspended' : 'restored'} successfully.` 
      });
      setPendingAction(null);
      
      // Reload stats and vendors list
      await loadStats();
      if (activeTab === 'all') {
        await loadAllVendors();
      } else {
        await loadPendingVendors();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Action failed.' });
    }
  };

  const pendingCount = stats?.pendingVerifications || 0;
  const totalCount = stats?.totalVendors || 0;
  const approvedCount = stats?.approvedVendors || 0;
  const suspendedCount = stats?.suspendedVendors || 0;

  return (
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Vendor Directory</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Vendor Management</h1>
          <p className="block text-muted text-[12px] mt-1">Manage vendor accounts, suspend compliance violations, and verify pending business registrations.</p>
        </div>
      </div>

      {/* Metric Cards Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard title="Total Vendors" value={totalCount} icon={Building2} tone="blue" />
        <MetricCard title="Pending Review" value={pendingCount} icon={ShieldOff} tone="amber" />
        <MetricCard title="Approved Vendors" value={approvedCount} icon={ShieldCheck} tone="green" />
        <MetricCard title="Suspended Accounts" value={suspendedCount} icon={UserX} tone="red" />
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
            All Vendors
          </button>
          
          <button
            onClick={() => handleTabChange('review')}
            className={`min-h-[46px] px-6 text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'review'
                ? 'border-admin-red text-admin-red'
                : 'border-transparent text-muted hover:text-ink'
            }`}
            type="button"
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black bg-admin-red text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Toolbar - Dynamic per active tab */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-[18px] justify-between">
          {activeTab === 'all' ? (
            <>
              <SearchBox
                value={query}
                onChange={setQuery}
                placeholder="Search by vendor name or email..."
              />
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Active', 'Suspended'].map((status) => (
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
                    {status}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted font-semibold">
              Applications awaiting admin verification and documents approval.
            </div>
          )}
        </div>

        {/* Loader and error handlers */}
        {loading ? <StateBlock title={activeTab === 'all' ? "Loading vendors" : "Loading applications"} message="Fetching records from server." /> : null}
        {error ? <StateBlock title="Unable to retrieve data" message={error} /> : null}

        {/* Data Table */}
        {!loading && !error ? (
          <div className="overflow-x-auto">
            {activeTab === 'all' ? (
              // All Vendors Table
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Owner Name</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Email</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Verification Status</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Account Status</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => {
                    const blocked = Boolean(vendor.userId?.isBlocked);
                    return (
                      <tr key={vendor._id} className="hover:bg-panel transition-colors border-b border-line">
                        <td className="p-[16px_12px] text-sm text-ink font-bold max-w-[200px] truncate" title={vendor.ownerName}>
                          {vendor.ownerName}
                        </td>
                        <td className="p-[16px_12px] text-sm text-ink max-w-[240px] truncate" title={vendorEmail(vendor)}>
                          {vendorEmail(vendor)}
                        </td>
                        <td className="p-[16px_12px]">
                          <StatusBadge status={vendor.onboardingStatus} />
                        </td>
                        <td className="p-[16px_12px]">
                          <StatusBadge status={blocked ? 'Suspended' : 'Active'} />
                        </td>
                        <td className="p-[16px_12px]">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/vendors/${vendor._id}`}
                              className="min-h-[32px] px-3 rounded-[7px] text-[12px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all inline-flex items-center gap-1.5"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </Link>
                            <button
                              className={`inline-flex items-center gap-1.5 min-h-[32px] px-2.5 border rounded-[7px] text-[12px] font-extrabold bg-white transition-all ${
                                blocked
                                  ? 'text-[#047857] border-line hover:border-green-200 hover:bg-green-50'
                                  : 'text-admin-red border-line hover:border-[#fecaca] hover:bg-admin-red-soft'
                              }`}
                              type="button"
                              disabled={!vendorUserId(vendor)}
                              onClick={() => setPendingAction({ type: blocked ? 'unblock' : 'block', vendor })}
                            >
                              {blocked ? <UserCheck size={14} /> : <UserX size={14} />}
                              <span>{blocked ? 'Restore' : 'Suspend'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              // Pending Review applications Table
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Owner Name</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Email</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Submitted Date</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Stage</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-panel transition-colors border-b border-line">
                      <td className="p-[16px_12px] text-sm text-ink font-bold max-w-[200px] truncate" title={vendor.ownerName}>
                        {vendor.ownerName}
                      </td>
                      <td className="p-[16px_12px] text-sm text-ink max-w-[240px] truncate" title={vendorEmail(vendor)}>
                        {vendorEmail(vendor)}
                      </td>
                      <td className="p-[16px_12px] text-sm text-ink">
                        {formatDate(vendor.createdAt)}
                      </td>
                      <td className="p-[16px_12px]">
                        <StatusBadge status={vendor.onboardingStatus} />
                      </td>
                      <td className="p-[16px_12px]">
                        <button
                          onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                          className="min-h-[32px] px-3.5 rounded-[7px] text-[12px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all inline-flex items-center gap-1.5"
                          type="button"
                        >
                          <Eye size={14} />
                          <span>Review Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Empty States */}
            {activeTab === 'all' && !vendors.length ? (
              <StateBlock title="No vendors found" message="Try adjusting your filters or search keywords." />
            ) : null}
            {activeTab === 'review' && !pendingVendors.length ? (
              <StateBlock title="No pending applications" message="Excellent! All registrations have been processed." />
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

      {/* Suspend / Restore Confirm Modal */}
      {pendingAction ? (
        <ConfirmModal
          title={pendingAction.type === 'block' ? 'Suspend vendor account?' : 'Restore vendor account?'}
          message={`Are you sure you want to ${
            pendingAction.type === 'block' ? 'suspend' : 'restore'
          } access for ${pendingAction.vendor.fullName || pendingAction.vendor.ownerName}?`}
          confirmLabel="Confirm"
          danger={pendingAction.type === 'block'}
          onCancel={() => setPendingAction(null)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </div>
  );
}

export default VendorManagement;
