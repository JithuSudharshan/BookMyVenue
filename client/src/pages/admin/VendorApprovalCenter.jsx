import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/admin/Pagination';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { getVendors } from '../../api/admin-api/adminApi';
import { formatDate, vendorEmail } from '../../utils/formatters';

function VendorApprovalCenter() {
  const [vendors, setVendors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

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
        status: statusFilter,
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

  useEffect(() => {
    loadVendors();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  if (loading) {
    return <StateBlock title="Loading approvals" message="Fetching vendor applications." />;
  }

  if (error) {
    return <StateBlock title="Unable to load approvals" message={error} />;
  }

  return (
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Vendor Management</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Vendor Verification</h1>
          <p className="block text-muted text-[12px] mt-1">Review and verify partner profiles and applications.</p>
        </div>
      </div>

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-[18px] justify-between">
          <div className="flex flex-wrap gap-1.5">
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'Pending'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('Pending')}
            >
              Pending
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
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold transition-all border ${
                statusFilter === 'All'
                  ? 'text-white bg-admin-red border-admin-red'
                  : 'text-[#6b5555] bg-white border-line hover:bg-admin-red-soft hover:text-admin-red'
              }`}
              type="button"
              onClick={() => setStatusFilter('All')}
            >
              All Requests
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Owner Name</th>
                <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Email</th>
                <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Submitted Date</th>
                <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Verification Status</th>
                <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">View Profile</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-panel transition-colors border-b border-line">
                  <td className="p-[16px_12px] text-sm text-ink font-bold">{vendor.ownerName}</td>
                  <td className="p-[16px_12px] text-sm text-ink">{vendorEmail(vendor)}</td>
                  <td className="p-[16px_12px] text-sm text-ink">{formatDate(vendor.createdAt)}</td>
                  <td className="p-[16px_12px]">
                    <StatusBadge status={vendor.onboardingStatus} />
                  </td>
                  <td className="p-[16px_12px]">
                    <button
                      className="min-h-[32px] px-3 rounded-[7px] text-[12px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all"
                      type="button"
                      onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!vendors.length ? (
            <StateBlock title="No applications found" message="There are no applications matching the selected status." />
          ) : null}
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      </section>
    </div>
  );
}

export default VendorApprovalCenter;
