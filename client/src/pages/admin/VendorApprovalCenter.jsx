import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/admin/Pagination';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { getVendors } from '../../services/adminService';
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
  const itemsPerPage = 10;

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
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading">
        <div>
          <span className="page-kicker">Vendor Management</span>
          <h1>Vendor Verification</h1>
          <p>Review and verify partner profiles and applications.</p>
        </div>
      </div>

      <section className="table-card">
        <div className="table-toolbar">
          <div className="segmented-control">
            <button
              className={statusFilter === 'Pending' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('Pending')}
            >
              Pending
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
            <button
              className={statusFilter === 'All' ? 'active' : ''}
              type="button"
              onClick={() => setStatusFilter('All')}
            >
              All Requests
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner Name</th>
                <th>Email</th>
                <th>Submitted Date</th>
                <th>Verification Status</th>
                <th>View Profile</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>
                    <strong>{vendor.businessName}</strong>
                  </td>
                  <td>{vendor.ownerName}</td>
                  <td>{vendorEmail(vendor)}</td>
                  <td>{formatDate(vendor.createdAt)}</td>
                  <td>
                    <StatusBadge status={vendor.onboardingStatus} />
                  </td>
                  <td>
                    <button
                      className="secondary-button"
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
