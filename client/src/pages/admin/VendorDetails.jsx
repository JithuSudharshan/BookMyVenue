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
    <div className="fixed inset-0 bg-black/55 backdrop-blur-[4px] flex items-center justify-center z-[9999] p-5" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-doc-modal w-full max-w-[780px] max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-[16px_20px] border-b border-line flex-shrink-0">
          <div>
            <strong className="text-[15px] font-bold text-ink">{doc.label}</strong>
            {doc.number && <span className="inline-block ml-2 font-mono text-[13px] text-muted">Doc No: {doc.number}</span>}
          </div>
          <button className="bg-transparent border-0 cursor-pointer p-1.5 rounded-md text-muted flex items-center transition-all hover:bg-gray-100 hover:text-ink" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-[300px] bg-[#f9fafb]">
          {!doc.url ? (
            <p className="text-muted text-sm">No document uploaded yet.</p>
          ) : isPdf ? (
            <iframe
              src={doc.url}
              title={doc.label}
              className="w-full h-[60vh] border-0 rounded-md"
            />
          ) : isImg ? (
            <img src={doc.url} alt={doc.label} className="max-w-full max-h-[60vh] object-contain rounded-md shadow-md" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted">
              <FileText size={40} />
              <p>Preview not available</p>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-white bg-admin-red border border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark transition-all inline-flex items-center gap-1.5 mt-3">
                <ExternalLink size={15} /> Open Document
              </a>
            </div>
          )}
        </div>
        {doc.url && (
          <div className="p-[12px_20px] border-t border-line flex-shrink-0 bg-white">
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all inline-flex items-center gap-1.5">
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
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Vendor Directory</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Vendor Details</h1>
          <p className="block text-muted text-[12px] mt-1">Review business information and documents to make verification decision.</p>
        </div>
      </div>

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-5 border-b border-line mb-6">
          <div>
            <h1 className="m-0 text-2xl font-bold text-ink">{selectedVendor.fullName || 'Vendor Details'}</h1>
          </div>
          <StatusBadge status={selectedVendor.onboardingStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] items-start">
          {/* Business Information Card */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><FileText size={18} className="text-admin-red" /> Business Information</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Vendor Name</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{selectedVendor.fullName || <em className="text-muted font-normal">Not provided</em>}</dd>
              {selectedVendor.roleInBusiness && (
                <>
                  <dt className="text-muted text-xs">Role in Business</dt>
                  <dd className="m-0 font-extrabold text-ink text-sm capitalize">{selectedVendor.roleInBusiness.replace(/_/g, ' ')}</dd>
                </>
              )}
              {fullAddress && (
                <>
                  <dt className="text-muted text-xs">Business Address</dt>
                  <dd className="m-0 font-extrabold text-ink text-sm">{fullAddress}</dd>
                </>
              )}
            </dl>
          </article>

          {/* Primary Contact Card */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><UserRound size={18} className="text-admin-red" /> Primary Contact / Owner</h2>
            <div className="flex items-center gap-3 my-4">
              <div className="grid place-items-center w-12 h-12 rounded-full text-white text-sm font-extrabold bg-gradient-to-br from-[#0f2f3a] to-[#45656b]">{getInitials(selectedVendor.ownerName)}</div>
              <div>
                <strong className="block text-ink font-bold text-sm">{selectedVendor.ownerName}</strong>
                <span className="block text-muted text-xs mt-0.5 capitalize">
                  {selectedVendor.roleInBusiness
                    ? selectedVendor.roleInBusiness.replace(/_/g, ' ')
                    : 'Vendor'}
                </span>
              </div>
            </div>
            <p className="flex items-center gap-2 text-muted text-sm mt-2"><Mail size={15} /> {vendorEmail(selectedVendor)}</p>
            <p className="flex items-center gap-2 text-muted text-sm mt-2"><Phone size={15} /> {selectedVendor.phone || 'Not available'}</p>
            {selectedVendor.alternatePhone && (
              <p className="flex items-center gap-2 text-muted text-sm mt-2"><Phone size={15} /> {selectedVendor.alternatePhone} <span className="text-[11px] text-muted ml-1">(Alternate)</span></p>
            )}
          </article>

          {/* Verification Documents Card */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin md:col-span-2">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><FileText size={18} className="text-admin-red" /> Verification Documents</h2>
            {documents.length === 0 ? (
              <p className="text-muted mt-3 text-sm">
                No verification documents submitted yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3.5 mt-4">
                {documents.map((doc) => (
                  <div className="p-[14px_16px] bg-[#fff7f7] border border-line rounded-[7px] w-[260px] shrink-0 flex flex-col justify-between" key={doc.key}>
                    <div>
                      <FileText size={18} className="text-admin-red mb-2" />
                      <strong className="block text-sm font-bold text-ink">{doc.label}</strong>
                      {doc.number && (
                        <span className="block mt-0.5 font-mono text-[13px] text-muted">
                          Doc No: {doc.number}
                        </span>
                      )}
                      <span className="block mt-1 text-muted text-xs">{doc.url ? 'Document uploaded' : 'Not uploaded yet'}</span>
                    </div>
                    <button
                      className={`min-h-[32px] px-3 rounded-[7px] text-[12px] font-extrabold transition-all inline-flex items-center gap-1 mt-3 w-fit ${
                        doc.url 
                          ? 'text-white bg-admin-red border border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark' 
                          : 'text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red'
                      }`}
                      type="button"
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
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin md:col-span-2">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><Clock size={18} className="text-admin-red" /> Approval Timeline</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Approval Status</dt>
              <dd className="m-0 font-extrabold text-ink text-sm"><StatusBadge status={selectedVendor.onboardingStatus} /></dd>
              {selectedVendor.onboardingStatus !== 'approved' && selectedVendor.adminRemarks && (
                <>
                  <dt className="text-muted text-xs">Rejection Reason</dt>
                  <dd className="m-0 font-extrabold text-ink text-sm">{selectedVendor.adminRemarks}</dd>
                </>
              )}
            </dl>
          </article>
        </div>

        <div className="flex items-center justify-between gap-3.5 mt-6 border-t border-line pt-4">
          {['requested', 'changes_requested', 'under_review'].includes(selectedVendor.onboardingStatus) && (
            <button
              className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-admin-red bg-white border border-[#fecaca] hover:bg-admin-red-soft hover:text-admin-red-dark transition-all"
              type="button"
              onClick={() => setPendingAction({ type: 'reject', vendor: selectedVendor })}
            >
              Reject
            </button>
          )}

          {selectedVendor.userId && (
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold border transition-all ${
                selectedVendor.userId.isBlocked 
                  ? 'text-white bg-admin-red border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark' 
                  : 'text-admin-red bg-white border-[#fecaca] hover:bg-admin-red-soft hover:text-admin-red-dark'
              }`}
              type="button"
              onClick={() => setPendingAction({ type: selectedVendor.userId.isBlocked ? 'unblock' : 'block', vendor: selectedVendor })}
            >
              {selectedVendor.userId.isBlocked ? 'Restore Account' : 'Suspend Account'}
            </button>
          )}

          {['requested', 'changes_requested', 'under_review'].includes(selectedVendor.onboardingStatus) && (
            <button
              className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-white bg-admin-red border border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark transition-all ml-auto"
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
          {pendingAction.type === 'reject' && (
            <div className="mt-4">
              <label htmlFor="rejectReason" className="block text-sm font-semibold text-ink mb-1.5">
                Reason for Rejection <span className="text-admin-red">*</span>
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
                className={`w-full p-2.5 rounded-[7px] text-sm text-ink outline-none bg-white border ${
                  formErrors.rejectReason ? 'border-admin-red' : 'border-line hover:border-admin-red focus:border-admin-red'
                } transition-colors`}
              />
              {formErrors.rejectReason && <div className="text-admin-red text-xs mt-1">{formErrors.rejectReason}</div>}
            </div>
          )}
        </ConfirmModal>
      ) : null}

      <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}

export default VendorDetails;
