import { FileText, MapPin, Users, IndianRupee, Clock, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { z } from 'zod';
import { getAdminVenueById, updateVenueStatus } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

const rejectReasonSchema = z.string().min(1, 'Reason for rejection is required');

function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  const loadVenue = async () => {
    setLoading(true);
    try {
      const data = await getAdminVenueById(id);
      setVenue(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenue();
  }, [id]);

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

      await updateVenueStatus(
        venue._id,
        isReject ? 'rejected' : 'approved',
        finalRejectReason
      );
      setToast({ type: 'success', message: `Venue ${isReject ? 'rejected' : 'approved'} successfully.` });
      setPendingAction(null);
      setRejectReason('');
      setFormErrors({});

      await loadVenue();
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
    return <StateBlock title="Loading venue" message="Fetching venue details." />;
  }

  if (error || !venue) {
    return <StateBlock title="Unable to load venue" message={error || "Venue not found."} />;
  }

  const approvalStatus = venue.approval?.status;

  return (
    <div className="page-stack">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <div className="page-heading with-actions">
        <div>
          <span className="page-kicker">Venue Management</span>
          <h1>Venue Details</h1>
          <p>Review venue information and make approval decisions.</p>
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
            <h1>{venue.name}</h1>
            <p>{venue.location?.city ? `${venue.location.city}, ${venue.location.state || ''}`.trim().replace(/,$/, '') : 'Location not specified'}</p>
          </div>
          <StatusBadge status={approvalStatus} />
        </div>

        <div className="detail-grid">
          <article className="detail-card">
            <h2><FileText size={18} /> Venue Information</h2>
            <dl>
              <dt>Venue Name</dt>
              <dd>{venue.name}</dd>
              <dt>Description</dt>
              <dd>{venue.description || 'No description provided'}</dd>
              <dt>Booking Model</dt>
              <dd>{venue.bookingModel ? venue.bookingModel.charAt(0).toUpperCase() + venue.bookingModel.slice(1) : 'Not specified'}</dd>
              {venue.bookingConfig?.openingTime && (
                <>
                  <dt>Operating Hours</dt>
                  <dd>{venue.bookingConfig.openingTime} – {venue.bookingConfig.closingTime}</dd>
                </>
              )}
            </dl>
          </article>

          <article className="detail-card">
            <h2><MapPin size={18} /> Location Details</h2>
            <dl>
              <dt>Address</dt>
              <dd>{venue.location?.address || 'Not provided'}</dd>
              <dt>City</dt>
              <dd>{venue.location?.city || 'Not provided'}</dd>
              <dt>State</dt>
              <dd>{venue.location?.state || 'Not provided'}</dd>
              <dt>Pincode</dt>
              <dd>{venue.location?.pincode || 'Not provided'}</dd>
            </dl>
          </article>

          <article className="detail-card">
            <h2><Users size={18} /> Capacity &amp; Pricing</h2>
            <dl>
              <dt>Capacity</dt>
              <dd>{venue.capacity ? `${venue.capacity} guests` : 'Not specified'}</dd>
              <dt>Price</dt>
              <dd>{venue.price != null ? `₹${venue.price.toLocaleString()}` : 'Not specified'}</dd>
              <dt>Venue Status</dt>
              <dd>{venue.venueStatus ? venue.venueStatus.charAt(0).toUpperCase() + venue.venueStatus.slice(1) : 'Inactive'}</dd>
            </dl>
          </article>

          <article className="detail-card">
            <h2><Clock size={18} /> Approval Timeline</h2>
            <dl>
              <dt>Submitted</dt>
              <dd>{formatDate(venue.approval?.submittedAt || venue.createdAt)}</dd>
              <dt>Reviewed</dt>
              <dd>{formatDate(venue.approval?.reviewedAt)}</dd>
              <dt>Approval Status</dt>
              <dd><StatusBadge status={approvalStatus} /></dd>
              {approvalStatus === 'rejected' && venue.approval?.rejectionReason && (
                <>
                  <dt>Rejection Reason</dt>
                  <dd>{venue.approval.rejectionReason}</dd>
                </>
              )}
            </dl>
          </article>
        </div>

        {venue.amenities && venue.amenities.length > 0 && (
          <article className="documents-panel">
            <h2><List size={18} /> Amenities</h2>
            <div className="document-grid">
              {venue.amenities.map((amenity, index) => (
                <div className="document-card" key={index}>
                  <FileText size={18} />
                  <strong>{amenity}</strong>
                </div>
              ))}
            </div>
          </article>
        )}

        {venue.rules && venue.rules.length > 0 && (
          <article className="documents-panel">
            <h2><FileText size={18} /> Venue Rules</h2>
            <div className="document-grid">
              {venue.rules.map((rule, index) => (
                <div className="document-card" key={index}>
                  <FileText size={18} />
                  <strong>{rule}</strong>
                </div>
              ))}
            </div>
          </article>
        )}

        {venue.images && venue.images.length > 0 && (
          <article className="documents-panel">
            <h2><FileText size={18} /> Venue Images</h2>
            <div className="document-grid">
              {venue.images.map((img, index) => (
                <div className="document-card" key={index}>
                  <FileText size={18} />
                  <strong>{img.isPrimary ? 'Primary Image' : `Image ${index + 1}`}</strong>
                  <span>{img.url ? 'Uploaded image' : 'No URL'}</span>
                </div>
              ))}
            </div>
          </article>
        )}

        <div className="approval-actions">
          {approvalStatus !== 'rejected' && (
            <button
              className="secondary-danger-button"
              type="button"
              onClick={() => setPendingAction({ type: 'reject' })}
            >
              Reject
            </button>
          )}
          {approvalStatus !== 'approved' && (
            <button
              className="primary-button"
              type="button"
              onClick={() => setPendingAction({ type: 'approve' })}
            >
              Approve Venue
            </button>
          )}
        </div>
      </section>

      {pendingAction ? (
        <ConfirmModal
          title={pendingAction.type === 'approve' ? 'Approve venue?' : 'Reject venue?'}
          message={`This will mark "${venue.name}" as ${pendingAction.type === 'approve' ? 'approved' : 'rejected'}.`}
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
                placeholder="Please explain why this venue is being rejected..."
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

export default VenueDetails;
