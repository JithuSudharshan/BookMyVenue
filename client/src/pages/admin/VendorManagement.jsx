import { Building2, ShieldCheck, ShieldOff, SlidersHorizontal, Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import MetricCard from '../../components/admin/MetricCard';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import usePagination from '../../hooks/usePagination';
import { updateUserBlockStatus, getVendors, updateVendorVerification, getDashboardStats } from '../../api/admin-api/adminApi';
import { formatDate, vendorEmail, vendorUserId } from '../../utils/formatters';

function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendors({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        accountStatus: statusFilter
      });
      setVendors(res.data || []);
      setTotalItems(res.pagination?.totalItems || 0);
      setTotalPages(res.pagination?.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res);
    } catch (e) {
      console.error(e);
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

  // Load data when page, search query, or account status filter changes
  useEffect(() => {
    loadVendors();
    loadStats();
  }, [currentPage, debouncedSearch, statusFilter]);

  const handleConfirm = async () => {
    try {
      if (pendingAction.type === 'block') {
        await updateUserBlockStatus(vendorUserId(pendingAction.vendor), true);
        setToast({ type: 'success', message: 'Vendor suspended successfully.' });
      }

      if (pendingAction.type === 'unblock') {
        await updateUserBlockStatus(vendorUserId(pendingAction.vendor), false);
        setToast({ type: 'success', message: 'Vendor restored successfully.' });
      }

      if (pendingAction.type === 'approve' || pendingAction.type === 'reject') {
        await updateVendorVerification(
          pendingAction.vendor._id,
          pendingAction.type === 'approve' ? 'approved' : 'rejected'
        );
        setToast({ type: 'success', message: 'Vendor verification updated.' });
      }

      setPendingAction(null);
      await loadVendors();
      await loadStats();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const pendingCount = stats?.pendingVerifications || 0;
  const totalCount = stats?.totalVendors || vendors.length;
  const topVendor = vendors[0];

  return (
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Vendor Management</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Vendor Directory</h1>
          <p className="block text-muted text-[12px] mt-1">Directory of venue owners and business partners.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <MetricCard title="Total Vendors" value={totalCount} detail="+12% this month" icon={Building2} tone="green" />
        <MetricCard title="Pending Verifications" value={pendingCount} detail="Requires attention" icon={ShieldOff} tone="amber" />
      </section>

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-[18px] justify-between">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search by vendor name or email..."
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
              All Vendors
            </button>
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'Active'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </button>
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'Suspended'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('Suspended')}
            >
              Suspended
            </button>
          </div>
        </div>

        {loading ? <StateBlock title="Loading vendors" message="Fetching vendor profiles." /> : null}
        {error ? <StateBlock title="Unable to load vendors" message={error} /> : null}
        {!loading && !error ? (
          <div className="overflow-x-auto">
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
                      <td className="p-[16px_12px] text-sm text-ink font-bold">
                        {vendor.ownerName}
                      </td>
                      <td className="p-[16px_12px] text-sm text-ink">
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
                            <Eye size={15} />
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
                            {blocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                            <span>{blocked ? 'Activate' : 'Suspend'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!vendors.length ? <StateBlock title="No vendors found" message="Try a different business or email search." /> : null}
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        ) : null}
      </section>

      {pendingAction ? (
        <ConfirmModal
          title="Confirm vendor update"
          message={`Apply this action to ${pendingAction.vendor.fullName}?`}
          confirmLabel="Confirm"
          danger={pendingAction.type === 'block' || pendingAction.type === 'reject'}
          onCancel={() => setPendingAction(null)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </div>
  );
}

export default VendorManagement;
