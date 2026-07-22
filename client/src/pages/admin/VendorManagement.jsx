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
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <span className="page-kicker">Vendor Management</span>
          <h1>Vendor Directory</h1>
          <p>Directory of venue owners and business partners.</p>
        </div>
      </div>

      <section className="metric-grid two">
        <MetricCard title="Total Vendors" value={totalCount} detail="+12% this month" icon={Building2} tone="green" />
        <MetricCard title="Pending Verifications" value={pendingCount} detail="Requires attention" icon={ShieldOff} tone="amber" />
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search by vendor name or email..."
          />
          <div className="segmented-control">
            <button
              className={statusFilter === 'All' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('All')}
            >
              All Vendors
            </button>
            <button
              className={statusFilter === 'Active' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </button>
            <button
              className={statusFilter === 'Suspended' ? 'active' : ''}
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
          <div className="table-scroll">
            <table>
              <thead>
                <tr>

                  <th>Owner Name</th>
                  <th>Email</th>
                  <th>Verification Status</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => {
                  const blocked = Boolean(vendor.userId?.isBlocked);
                  return (
                    <tr key={vendor._id}>

                      <td>
                        {vendor.ownerName}
                      </td>
                      <td>
                        {vendorEmail(vendor)}
                      </td>
                      <td>
                        <StatusBadge status={vendor.onboardingStatus} />
                      </td>
                      <td>
                        <StatusBadge status={blocked ? 'Suspended' : 'Active'} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={`/admin/vendors/${vendor._id}`}
                            className="icon-text-button secondary-button"
                            style={{ textDecoration: 'none' }}
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </Link>
                          <button
                            className={blocked ? 'icon-text-button approve' : 'icon-text-button danger'}
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
