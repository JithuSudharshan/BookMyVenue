import { FileText, Mail, Phone, Printer, Share2, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { z } from 'zod';
import { getVendorById, updateVendorVerification, updateUserBlockStatus } from '../../services/adminService';
import { getInitials, vendorEmail } from '../../utils/formatters';

const rejectReasonSchema = z.string().min(1, 'Reason for rejection is required');

function VendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  const loadVendor = async () => {
    setLoading(true);
    try {
      const data = await getVendorById(id);
      setSelectedVendor(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [id]);

  const handleConfirm = async () => {
    try {
      if (pendingAction.type === 'block' || pendingAction.type === 'unblock') {
        const isBlock = pendingAction.type === 'block';
        await updateUserBlockStatus(selectedVendor.userId._id, isBlock);
        setToast({ type: 'success', message: `Vendor ${isBlock ? 'suspended' : 'restored'} successfully.` });
        setPendingAction(null);
        await loadVendor();
        return;
      }

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
      setRejectReason('');
      setFormErrors({});

      await loadVendor();
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
    return <StateBlock title="Loading vendor" message="Fetching vendor profile." />;
  }

  if (error || !selectedVendor) {
    return <StateBlock title="Unable to load vendor" message={error || "Vendor not found."} />;
  }

  return (
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading with-actions">
        <div>
          <span className="page-kicker">Vendor Directory</span>
          <h1>Vendor Details</h1>
          <p>Review business information and documents to make verification decision.</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
      </div>

      <section className="approval-detail">
        <div className="approval-detail-header">
          <div>
            <h1>{selectedVendor.businessName}</h1>
            <p>Category: Venue Partner</p>
          </div>
          <StatusBadge status={selectedVendor.onboardingStatus} />
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
          {selectedVendor.onboardingStatus !== 'rejected' && (
            <button
              className="secondary-danger-button"
              type="button"
              onClick={() => setPendingAction({ type: 'reject', vendor: selectedVendor })}
            >
              Reject
            </button>
          )}
          <button className="secondary-button" type="button">
            Request Document Clarification
          </button>
          {selectedVendor.userId && (
            <button
              className={selectedVendor.userId.isBlocked ? 'primary-button' : 'secondary-danger-button'}
              type="button"
              onClick={() => setPendingAction({ type: selectedVendor.userId.isBlocked ? 'unblock' : 'block', vendor: selectedVendor })}
            >
              {selectedVendor.userId.isBlocked ? 'Restore Account' : 'Suspend Account'}
            </button>
          )}
          {selectedVendor.onboardingStatus !== 'approved' && (
            <button
              className="primary-button"
              type="button"
              onClick={() => setPendingAction({ type: 'approve', vendor: selectedVendor })}
            >
              Approve Vendor
            </button>
          )}
        </div>
      </section>

      {pendingAction ? (
        <ConfirmModal
          title={
            pendingAction.type === 'approve'
              ? 'Approve vendor?'
              : pendingAction.type === 'reject'
              ? 'Reject vendor?'
              : pendingAction.type === 'block'
              ? 'Suspend vendor?'
              : 'Restore vendor?'
          }
          message={
            pendingAction.type === 'block' || pendingAction.type === 'unblock'
              ? `Are you sure you want to ${pendingAction.type === 'block' ? 'suspend' : 'restore'} ${selectedVendor.businessName}?`
              : `This will mark ${pendingAction.vendor.businessName} as ${pendingAction.type === 'approve' ? 'approved' : 'rejected'}.`
          }
          confirmLabel={
            pendingAction.type === 'approve'
              ? 'Approve'
              : pendingAction.type === 'reject'
              ? 'Reject'
              : pendingAction.type === 'block'
              ? 'Suspend'
              : 'Restore'
          }
          danger={pendingAction.type === 'reject' || pendingAction.type === 'block'}
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

export default VendorDetails;
