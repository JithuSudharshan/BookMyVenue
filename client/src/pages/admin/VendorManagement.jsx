import { Building2, ShieldCheck, ShieldOff, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import MetricCard from '../../components/admin/MetricCard';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import usePagination from '../../hooks/usePagination';
import { blockUser, getVendors, unblockUser, updateVendorVerification } from '../../services/adminService';
import { formatDate, vendorEmail, vendorUserId } from '../../utils/formatters';

function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);

  const loadVendors = async () => {
    setLoading(true);
    try {
      setVendors(await getVendors());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return vendors.filter((vendor) => {
      const matchesSearch =
        vendor.businessName?.toLowerCase().includes(normalized) ||
        vendor.ownerName?.toLowerCase().includes(normalized) ||
        vendorEmail(vendor).toLowerCase().includes(normalized);

      const blocked = Boolean(vendor.userId?.isBlocked);
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && !blocked) ||
        (statusFilter === 'Suspended' && blocked);

      return matchesSearch && matchesStatus;
    });
  }, [query, vendors, statusFilter]);

  const { currentPage, totalPages, paginatedItems: pagedVendors, goToPage, resetPage, totalItems, itemsPerPage } = usePagination(filteredVendors);

  useEffect(() => {
    resetPage();
  }, [query, statusFilter]);

  const pendingCount = vendors.filter((vendor) => vendor.verificationStatus === 'pending').length;
  const topVendor = vendors[0];

  const handleConfirm = async () => {
    try {
      if (pendingAction.type === 'block') {
        await blockUser(vendorUserId(pendingAction.vendor));
        setToast({ type: 'success', message: 'Vendor suspended successfully.' });
      }

      if (pendingAction.type === 'unblock') {
        await unblockUser(vendorUserId(pendingAction.vendor));
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
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

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

      <section className="metric-grid three">
        <MetricCard title="Total Vendors" value={vendors.length} detail="+12% this month" icon={Building2} tone="green" />
        <MetricCard title="Pending Verifications" value={pendingCount} detail="Requires attention" icon={ShieldOff} tone="amber" />
        <MetricCard
          title="Top Performing"
          value={topVendor?.businessName || 'No vendor yet'}
          detail="Future revenue API placeholder"
          icon={ShieldCheck}
          tone="mint"
        />
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Search by business name or email..."
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
                  <th>Business Name</th>
                  <th>Owner Name</th>
                  <th>Email</th>
                  <th>Verification Status</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedVendors.map((vendor) => {
                  const blocked = Boolean(vendor.userId?.isBlocked);
                  return (
                    <tr key={vendor._id}>
                      <td>
                        <strong>{vendor.businessName}</strong>
                      </td>
                      <td>
                        {vendor.ownerName}
                      </td>
                      <td>
                        {vendorEmail(vendor)}
                      </td>
                      <td>
                        <StatusBadge status={vendor.verificationStatus} />
                      </td>
                      <td>
                        <StatusBadge status={blocked ? 'Suspended' : 'Active'} />
                      </td>
                      <td>
                        <button
                          className={blocked ? 'icon-text-button approve' : 'icon-text-button danger'}
                          type="button"
                          disabled={!vendorUserId(vendor)}
                          onClick={() => setPendingAction({ type: blocked ? 'unblock' : 'block', vendor })}
                        >
                          {blocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
                          <span>{blocked ? 'Activate' : 'Suspend'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filteredVendors.length ? <StateBlock title="No vendors found" message="Try a different business or email search." /> : null}
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={goToPage} />
          </div>
        ) : null}
      </section>

      {pendingAction ? (
        <ConfirmModal
          title="Confirm vendor update"
          message={`Apply this action to ${pendingAction.vendor.businessName}?`}
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
