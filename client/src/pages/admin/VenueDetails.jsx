import { FileText, MapPin, Users, Clock, List, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';
import { z } from 'zod';
import { getAdminVenueById, updateVenueStatus, updateVenueVisibility } from '../../api/admin-api/adminApi';
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

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      if (pendingAction.type === 'deactivate' || pendingAction.type === 'activate') {
        const isDeactivate = pendingAction.type === 'deactivate';
        await updateVenueVisibility(venue._id, isDeactivate ? 'inactive' : 'active');
        setToast({ type: 'success', message: `Venue ${isDeactivate ? 'deactivated' : 'activated'} successfully.` });
        setPendingAction(null);
        await loadVenue();
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
      </div>

      <section className="approval-detail">
        <div className="approval-detail-header">
          <div>
            <h1>{venue.name}</h1>
            <p>{venue.location?.city ? `${venue.location.city}, ${venue.location.state || ''}`.trim().replace(/,$/, '') : 'Location not specified'}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <StatusBadge status={approvalStatus} />
            {approvalStatus === 'approved' && (
              <StatusBadge status={venue.venueStatus === 'active' ? 'Active' : 'Inactive'} />
            )}
          </div>
        </div>

        <div className="detail-grid">
          {/* Card 1: Venue Information */}
          <article className="detail-card">
            <h2><FileText size={18} /> Venue Information</h2>
            <dl>
              <dt>Description</dt>
              <dd>{venue.description || 'No description provided'}</dd>
              <dt>Category</dt>
              <dd>{venue.categoryId?.name || venue.categoryId || 'Not specified'}</dd>
              <dt>Subcategory</dt>
              <dd>{venue.subcategoryId?.name || venue.subcategoryId || 'Not specified'}</dd>
              <dt>Venue Images</dt>
              <dd>
                {venue.images && venue.images.length > 0 ? (
                  <button 
                    className="secondary-button" 
                    onClick={() => {
                      setCurrentImageIndex(0);
                      setIsImageViewerOpen(true);
                    }}
                    style={{ padding: '4px 12px', fontSize: '13px' }}
                  >
                    View {venue.images.length} Images
                  </button>
                ) : 'No images available'}
              </dd>
            </dl>
          </article>

          {/* Card 2: Operations & Pricing */}
          <article className="detail-card">
            <h2><Users size={18} /> Operations & Pricing</h2>
            <dl>
              <dt>Capacity</dt>
              <dd>{venue.capacity ? `${venue.capacity} guests` : 'Not specified'}</dd>
              <dt>Price</dt>
              <dd>{venue.price != null ? `₹${venue.price.toLocaleString()}` : 'Not specified'}</dd>
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

          {/* Card 3: Owner Details */}
          <article className="detail-card">
            <h2><User size={18} /> Owner Details</h2>
            <dl>
              <dt>Name</dt>
              <dd>{venue.vendor?.fullName || venue.vendor?.firstName || 'Not specified'}</dd>
              <dt>Email</dt>
              <dd>
                {venue.vendor?.email || venue.vendor?.accountEmail ? (
                  <a href={`mailto:${venue.vendor?.email || venue.vendor?.accountEmail}`}>
                    {venue.vendor?.email || venue.vendor?.accountEmail}
                  </a>
                ) : 'Not provided'}
              </dd>
              <dt>Phone</dt>
              <dd>
                {venue.vendor?.phone ? (
                  <a href={`tel:${venue.vendor?.phone}`}>{venue.vendor?.phone}</a>
                ) : 'Not provided'}
              </dd>
            </dl>
          </article>

          {/* Card 3: Location Details */}
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

          {/* Card 4: Amenities & Rules */}
          <article className="detail-card">
            <h2><List size={18} /> Amenities & Rules</h2>
            <dl>
              <dt>Amenities</dt>
              <dd>{venue.amenities?.length ? venue.amenities.join(', ') : 'None specified'}</dd>
              <dt>Rules</dt>
              <dd>
                {venue.rules?.length ? (
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {venue.rules.map((rule, index) => <li key={index}>{rule}</li>)}
                  </ul>
                ) : 'None specified'}
              </dd>
            </dl>
          </article>

          {/* Card 5: Approval Timeline */}
          <article className="detail-card">
            <h2><Clock size={18} /> Approval Timeline</h2>
            <dl>
              <dt>Approval Status</dt>
              <dd><StatusBadge status={approvalStatus} /></dd>
              {approvalStatus === 'approved' && (
                <>
                  <dt>Visibility Status</dt>
                  <dd><StatusBadge status={venue.venueStatus} /></dd>
                </>
              )}
              {approvalStatus !== 'approved' && venue.approval?.rejectionReason && (
                <>
                  <dt>Rejection Reason</dt>
                  <dd>{venue.approval.rejectionReason}</dd>
                </>
              )}
            </dl>
          </article>
        </div>

        {venue.slots && venue.slots.length > 0 && (
          <section className="table-card" style={{ marginTop: '20px' }}>
            <div className="table-toolbar" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Available Slots</h3>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {venue.slots.map((slot) => (
                    <tr key={slot._id}>
                      <td>{formatDate(slot.date)}</td>
                      <td>{slot.startTime}</td>
                      <td>{slot.endTime}</td>
                      <td>₹{slot.price?.toLocaleString()}</td>
                      <td><StatusBadge status={slot.isBooked ? 'Booked' : 'Available'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="approval-actions">
          {['submitted', 'under_review'].includes(approvalStatus) && (
            <>
              <button
                className="secondary-danger-button"
                type="button"
                onClick={() => setPendingAction({ type: 'reject' })}
              >
                Reject
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => setPendingAction({ type: 'approve' })}
              >
                Approve Venue
              </button>
            </>
          )}
          {approvalStatus === 'approved' && (
            <button
              className={venue.venueStatus === 'active' ? 'secondary-danger-button' : 'primary-button'}
              type="button"
              onClick={() => setPendingAction({ type: venue.venueStatus === 'active' ? 'deactivate' : 'activate' })}
            >
              {venue.venueStatus === 'active' ? 'Deactivate Venue' : 'Activate Venue'}
            </button>
          )}
        </div>
      </section>

      {/* Image Viewer Overlay */}
      {isImageViewerOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsImageViewerOpen(false)} 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', 
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <button 
            onClick={() => setIsImageViewerOpen(false)} 
            style={{ 
              position: 'absolute', top: '24px', right: '32px', background: 'transparent', 
              border: 'none', color: '#fff', fontSize: '32px', cursor: 'pointer' 
            }}
          >
            &times;
          </button>
          
          <img 
            src={venue.images[currentImageIndex].url} 
            alt="Venue image" 
            style={{ maxWidth: '90%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
            onClick={(e) => e.stopPropagation()} 
          />
          
          {venue.images.length > 1 && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '20px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
              <button 
                className="secondary-button" 
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? venue.images.length - 1 : prev - 1)}
                style={{ backgroundColor: '#fff', color: '#000', border: 'none' }}
              >
                Previous
              </button>
              <span style={{ color: '#fff', fontWeight: 500 }}>
                {currentImageIndex + 1} / {venue.images.length}
              </span>
              <button 
                className="secondary-button" 
                onClick={() => setCurrentImageIndex(prev => prev === venue.images.length - 1 ? 0 : prev + 1)}
                style={{ backgroundColor: '#fff', color: '#000', border: 'none' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {pendingAction ? (
        <ConfirmModal
          title={
            pendingAction.type === 'approve'
              ? 'Approve venue?'
              : pendingAction.type === 'reject'
                ? 'Reject venue?'
                : pendingAction.type === 'deactivate'
                  ? 'Deactivate venue?'
                  : 'Activate venue?'
          }
          message={
            pendingAction.type === 'deactivate' || pendingAction.type === 'activate'
              ? `Are you sure you want to ${pendingAction.type === 'deactivate' ? 'deactivate' : 'activate'} "${venue.name}"?`
              : `This will mark "${venue.name}" as ${pendingAction.type === 'approve' ? 'approved' : 'rejected'}.`
          }
          confirmLabel={
            pendingAction.type === 'approve'
              ? 'Approve'
              : pendingAction.type === 'reject'
                ? 'Reject'
                : pendingAction.type === 'deactivate'
                  ? 'Deactivate'
                  : 'Activate'
          }
          danger={pendingAction.type === 'reject' || pendingAction.type === 'deactivate'}
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

