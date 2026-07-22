import { ExternalLink, FileText, Mail, Phone, UserRound, X, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { z } from 'zod';
import { getVendorById, updateVendorVerification, updateUserBlockStatus } from '../../api/admin-api/adminApi';
import { getInitials, vendorEmail } from '../../utils/formatters';

const rejectReasonSchema = z.string().min(1, 'Reason for rejection is required');

const DOCUMENT_TYPE_LABELS = {
  aadhar: 'Aadhaar Card',
  pan: 'PAN Card',
  driving_license: 'Driving License',
  passport: 'Passport',
  voter_id: 'Voter ID',
};

// Detect if a URL points to an image (handles Cloudinary URLs)
const isImageUrl = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  // Cloudinary images often have no extension; check for /image/ in URL
  if (lower.includes('/image/upload/')) return true;
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/.test(lower);
};

function DocumentPreviewModal({ doc, onClose }) {
  if (!doc) return null;

  const isPdf = doc.url && /\.pdf(\?|$)/i.test(doc.url);
  const isImg = isImageUrl(doc.url);

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal-header">
          <div>
            <strong>{doc.label}</strong>
            {doc.number && <span className="doc-modal-number">Doc No: {doc.number}</span>}
          </div>
          <button className="doc-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="doc-modal-body">
          {!doc.url ? (
            <p className="doc-modal-empty">No document uploaded yet.</p>
          ) : isPdf ? (
            <iframe
              src={doc.url}
              title={doc.label}
              className="doc-modal-iframe"
            />
          ) : isImg ? (
            <img src={doc.url} alt={doc.label} className="doc-modal-img" />
          ) : (
            <div className="doc-modal-fallback">
              <FileText size={40} />
              <p>Preview not available</p>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="primary-button" style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={15} /> Open Document
              </a>
            </div>
          )}
        </div>
        {doc.url && (
          <div className="doc-modal-footer">
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="secondary-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ExternalLink size={14} /> Open in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [previewDoc, setPreviewDoc] = useState(null);

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

      setTimeout(() => {
        navigate('/admin/vendor-approvals');
      }, 1500);
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

  const identity = selectedVendor.identity || {};
  const identityLabel = DOCUMENT_TYPE_LABELS[identity.documentType] || identity.documentType || null;

  // Build the real documents list from model fields only
  const documents = [];
  if (identityLabel || identity.documentUrl) {
    documents.push({
      key: 'identity',
      label: identityLabel || 'Identity Document',
      number: identity.documentNumber || null,
      url: identity.documentUrl || null,
    });
  }

  const address = selectedVendor.address;
  const fullAddress = address
    ? [address.line1, address.line2, address.city, address.state, address.pincode, address.country]
      .filter(Boolean)
      .join(', ')
    : null;

  return (
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading with-actions">
        <div>
          <span className="page-kicker">Vendor Directory</span>
          <h1>Vendor Details</h1>
          <p>Review business information and documents to make verification decision.</p>
        </div>
      </div>

      <section className="approval-detail">
        <div className="approval-detail-header">
          <div>
            <h1>{selectedVendor.fullName || 'Vendor Details'}</h1>
          </div>
          <StatusBadge status={selectedVendor.onboardingStatus} />
        </div>

        <div className="detail-grid">
          {/* Business Information Card */}
          <article className="detail-card">
            <h2><FileText size={18} /> Business Information</h2>
            <dl>
              <dt>Vendor Name</dt>
              <dd>{selectedVendor.fullName || <em style={{ color: 'var(--muted)', fontWeight: 400 }}>Not provided</em>}</dd>
              {selectedVendor.roleInBusiness && (
                <>
                  <dt>Role in Business</dt>
                  <dd style={{ textTransform: 'capitalize' }}>{selectedVendor.roleInBusiness.replace(/_/g, ' ')}</dd>
                </>
              )}
              {fullAddress && (
                <>
                  <dt>Business Address</dt>
                  <dd>{fullAddress}</dd>
                </>
              )}
            </dl>
          </article>

          {/* Primary Contact Card */}
          <article className="detail-card">
            <h2><UserRound size={18} /> Primary Contact / Owner</h2>
            <div className="contact-row">
              <div className="avatar large">{getInitials(selectedVendor.ownerName)}</div>
              <div>
                <strong>{selectedVendor.ownerName}</strong>
                <span style={{ textTransform: 'capitalize' }}>
                  {selectedVendor.roleInBusiness
                    ? selectedVendor.roleInBusiness.replace(/_/g, ' ')
                    : 'Vendor'}
                </span>
              </div>
            </div>
            <p><Mail size={15} /> {vendorEmail(selectedVendor)}</p>
            <p><Phone size={15} /> {selectedVendor.phone || 'Not available'}</p>
            {selectedVendor.alternatePhone && (
              <p><Phone size={15} /> {selectedVendor.alternatePhone} <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: 4 }}>(Alternate)</span></p>
            )}
          </article>

          {/* Verification Documents Card */}
          <article className="detail-card">
            <h2><FileText size={18} /> Verification Documents</h2>
            {documents.length === 0 ? (
              <p style={{ color: 'var(--muted)', marginTop: '12px', fontSize: '14px' }}>
                No verification documents submitted yet.
              </p>
            ) : (
              <div className="document-grid" style={{ marginTop: '16px' }}>
                {documents.map((doc) => (
                  <div className="document-card" key={doc.key}>
                    <FileText size={18} />
                    <strong>{doc.label}</strong>
                    {doc.number && (
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                        Doc No: {doc.number}
                      </span>
                    )}
                    <span>{doc.url ? 'Document uploaded' : 'Not uploaded yet'}</span>
                    <button
                      className={doc.url ? 'primary-button' : 'secondary-button'}
                      type="button"
                      style={{ marginTop: '10px', padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => setPreviewDoc(doc)}
                      disabled={!doc.url}
                    >
                      <ExternalLink size={13} />
                      {doc.url ? 'View Document' : 'Not Available'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Approval Timeline Card */}
          <article className="detail-card">
            <h2><Clock size={18} /> Approval Timeline</h2>
            <dl>
              <dt>Approval Status</dt>
              <dd><StatusBadge status={selectedVendor.onboardingStatus} /></dd>
              {selectedVendor.onboardingStatus !== 'approved' && selectedVendor.adminRemarks && (
                <>
                  <dt>Rejection Reason</dt>
                  <dd>{selectedVendor.adminRemarks}</dd>
                </>
              )}
            </dl>
          </article>
        </div>

        <div className="approval-actions">
          {['requested', 'changes_requested', 'under_review'].includes(selectedVendor.onboardingStatus) && (
            <button
              className="secondary-danger-button"
              type="button"
              onClick={() => setPendingAction({ type: 'reject', vendor: selectedVendor })}
            >
              Reject
            </button>
          )}

          {selectedVendor.userId && (
            <button
              className={selectedVendor.userId.isBlocked ? 'primary-button' : 'secondary-danger-button'}
              type="button"
              onClick={() => setPendingAction({ type: selectedVendor.userId.isBlocked ? 'unblock' : 'block', vendor: selectedVendor })}
            >
              {selectedVendor.userId.isBlocked ? 'Restore Account' : 'Suspend Account'}
            </button>
          )}

          {['requested', 'changes_requested', 'under_review'].includes(selectedVendor.onboardingStatus) && (
            <button
              className="primary-button"
              type="button"
              onClick={() => setPendingAction({ type: 'approve', vendor: selectedVendor })}
            >
              Approve Vendor
            </button>
          )}
        </div>
      </section >

      {
        pendingAction ? (
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
                ? `Are you sure you want to ${pendingAction.type === 'block' ? 'suspend' : 'restore'} ${selectedVendor.fullName}?`
                : `This will mark ${pendingAction.vendor.fullName} as ${pendingAction.type === 'approve' ? 'approved' : 'rejected'}.`
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
            {
              pendingAction.type === 'reject' && (
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
              )
            }
          </ConfirmModal >
        ) : null}

      <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div >
  );
}

export default VendorDetails;
