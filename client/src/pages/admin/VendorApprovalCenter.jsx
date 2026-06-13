import { FileText, Mail, Phone, Printer, Share2, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Pagination from '../../components/admin/Pagination';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import usePagination from '../../hooks/usePagination';
import { z } from 'zod';
import { getVendors, updateVendorVerification } from '../../services/adminService';
import { formatDate, getInitials, vendorEmail } from '../../utils/formatters';

const rejectReasonSchema = z.string().min(1, 'Reason for rejection is required');

function VendorApprovalCenter() {
  const [vendors, setVendors] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await getVendors();
      setVendors(data);
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
    return vendors.filter((vendor) => {
      if (statusFilter === 'All') return true;
      return vendor.verificationStatus?.toLowerCase() === statusFilter.toLowerCase();
    });
  }, [vendors, statusFilter]);

  const { currentPage, totalPages, paginatedItems: pagedVendors, goToPage, resetPage, totalItems, itemsPerPage } = usePagination(filteredVendors);

  useEffect(() => {
    resetPage();
  }, [statusFilter]);

  const selectedVendor = useMemo(
    () => vendors.find((vendor) => vendor._id === selectedId),
    [selectedId, vendors]
  );

  const handleConfirm = async () => {
    try {
      const isReject = pendingAction.type === 'reject';
      let finalRejectReason = null;

      if (isReject) {
        try {
          finalRejectReason = rejectReasonSchema.parse(rejectReason.trim());
          setFormErrors({});
        } catch (zodErr) {
          setFormErrors({ rejectReason: zodErr.errors[0].message });
          return;
        }
      }

      await updateVendorVerification(
        pendingAction.vendor._id,
        isReject ? 'rejected' : 'approved',
        finalRejectReason
      );
      setToast({ type: 'success', message: 'Vendor application updated.' });
      setPendingAction(null);
      setSelectedId('');
      setRejectReason('');
      setFormErrors({});

      await loadVendors();
    } catch (err) {
      if (err.data && err.data.errors) {
        const fieldErrors = {};
        err.data.errors.forEach(e => {
          const field = e.path[e.path.length - 1];
          if (field) fieldErrors[field] = e.message;
        });
        setFormErrors(fieldErrors);
      } else {
        setToast({ type: 'error', message: err.message });
      }
    }
  };

  if (loading) {
    return <StateBlock title="Loading approvals" message="Fetching vendor applications." />;
  }

  if (error) {
    return <StateBlock title="Unable to load approvals" message={error} />;
  }

  if (!selectedId) {
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
                {pagedVendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td>
                      <strong>{vendor.businessName}</strong>
                    </td>
                    <td>{vendor.ownerName}</td>
                    <td>{vendorEmail(vendor)}</td>
                    <td>{formatDate(vendor.createdAt)}</td>
                    <td>
                      <StatusBadge status={vendor.verificationStatus} />
                    </td>
                    <td>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => setSelectedId(vendor._id)}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredVendors.length ? (
              <StateBlock title="No applications found" message="There are no applications matching the selected status." />
            ) : null}
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={goToPage} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading with-actions">
        <div>
          <span className="page-kicker">Vendor Verification</span>
          <h1>Review Application</h1>
          <p>Review business information and documents to make verification decision.</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setSelectedId('')}
        >
          &larr; Back to Verification List
        </button>
      </div>

      <section className="approval-detail">
        {selectedVendor ? (
          <>
            <div className="approval-detail-header">
              <div>
                <h1>{selectedVendor.businessName}</h1>
                <p>Category: Venue Partner</p>
              </div>
              <StatusBadge status={selectedVendor.verificationStatus} />
              <button className="icon-button" type="button" aria-label="Print application">
                <Printer size={17} />
              </button>
              <button className="icon-button" type="button" aria-label="Share application">
                <Share2 size={17} />
              </button>
            </div>

            <div className="detail-grid">
              <article className="detail-card">
                <h2><FileText size={18} /> Business Information</h2>
                <dl>
                  <dt>Legal Company Name</dt>
                  <dd>{selectedVendor.businessName}</dd>
                  <dt>Registration Number</dt>
                  <dd>{selectedVendor.GSTNumber || 'Not provided'}</dd>
                  <dt>Years in Business</dt>
                  <dd>8 Years</dd>
                  <dt>Insurance Coverage</dt>
                  <dd>$2M Policy</dd>
                </dl>
              </article>

              <article className="detail-card">
                <h2><UserRound size={18} /> Primary Contact / Owner</h2>
                <div className="contact-row">
                  <div className="avatar large">{getInitials(selectedVendor.ownerName)}</div>
                  <div>
                    <strong>{selectedVendor.ownerName}</strong>
                    <span>Owner</span>
                  </div>
                </div>
                <p><Mail size={15} /> {vendorEmail(selectedVendor)}</p>
                <p><Phone size={15} /> {selectedVendor.phone || 'Not available'}</p>
              </article>
            </div>

            <article className="documents-panel">
              <h2><FileText size={18} /> Verification Documents</h2>
              <div className="document-grid">
                {(selectedVendor.documents?.length ? selectedVendor.documents : [{ name: 'Business License' }, { name: 'Tax Certificate' }, { name: 'Insurance Policy' }]).map((doc) => (
                  <div className="document-card" key={doc.name}>
                    <FileText size={18} />
                    <strong>{doc.name}</strong>
                    <span>{doc.url ? 'Uploaded document' : 'Future document upload placeholder'}</span>
                  </div>
                ))}
              </div>
            </article>

            <div className="approval-actions">
              <button
                className="secondary-danger-button"
                type="button"
                onClick={() => setPendingAction({ type: 'reject', vendor: selectedVendor })}
              >
                Reject
              </button>
              <button className="secondary-button" type="button">
                Request Document Clarification
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => setPendingAction({ type: 'approve', vendor: selectedVendor })}
              >
                Approve Vendor
              </button>
            </div>
          </>
        ) : (
          <StateBlock title="No vendor selected" message="Select an application from the queue." />
        )}
      </section>

      {pendingAction ? (
        <ConfirmModal
          title={pendingAction.type === 'approve' ? 'Approve vendor?' : 'Reject vendor?'}
          message={`This will mark ${pendingAction.vendor.businessName} as ${pendingAction.type === 'approve' ? 'approved' : 'rejected'}.`}
          confirmLabel={pendingAction.type === 'approve' ? 'Approve' : 'Reject'}
          danger={pendingAction.type === 'reject'}
          onCancel={() => {
            setPendingAction(null);
            setRejectReason('');
            setFormErrors({});
          }}
          onConfirm={handleConfirm}
        >
          {pendingAction.type === 'reject' && (
            <div className="modal-input-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="rejectReason" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Reason for Rejection <span style={{ color: 'var(--danger-color, #ef4444)' }}>*</span>
              </label>
              <textarea
                id="rejectReason"
                rows="3"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (formErrors.rejectReason) setFormErrors({});
                }}
                placeholder="Please explain why this application is being rejected..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: formErrors.rejectReason ? '1px solid var(--danger-color, #ef4444)' : '1px solid var(--border-color, #ccc)', fontFamily: 'inherit' }}
              />
              {formErrors.rejectReason && <div className="field-error" style={{ color: 'var(--danger-color, #ef4444)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{formErrors.rejectReason}</div>}
            </div>
          )}
        </ConfirmModal>
      ) : null}
    </div>
  );
}

export default VendorApprovalCenter;
