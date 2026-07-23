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
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div>
          <span className="text-admin-red text-[14px] font-extrabold">Venue Management</span>
          <h1 className="m-0 text-3xl sm:text-4xl font-extrabold leading-none text-ink mt-1">Venue Details</h1>
          <p className="block text-muted text-[12px] mt-1">Review venue information and make approval decisions.</p>
        </div>
      </div>

      <section className="bg-surface border border-line rounded-lg shadow-admin p-[22px]">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-5 border-b border-line mb-6">
          <div>
            <h1 className="m-0 text-2xl font-bold text-ink">{venue.name}</h1>
            <p className="block text-muted text-xs mt-1">{venue.location?.city ? `${venue.location.city}, ${venue.location.state || ''}`.trim().replace(/,$/, '') : 'Location not specified'}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={approvalStatus} />
            {approvalStatus === 'approved' && (
              <StatusBadge status={venue.venueStatus === 'active' ? 'Active' : 'Inactive'} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px] items-start">
          {/* Card 1: Venue Information */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><FileText size={18} className="text-admin-red" /> Venue Information</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Description</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.description || 'No description provided'}</dd>
              <dt className="text-muted text-xs">Category</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.categoryId?.name || venue.categoryId || 'Not specified'}</dd>
              <dt className="text-muted text-xs">Subcategory</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.subcategoryId?.name || venue.subcategoryId || 'Not specified'}</dd>
              <dt className="text-muted text-xs">Venue Images</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">
                {venue.images && venue.images.length > 0 ? (
                  <button 
                    className="min-h-[28px] px-3 rounded-[7px] text-xs font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all" 
                    onClick={() => {
                      setCurrentImageIndex(0);
                      setIsImageViewerOpen(true);
                    }}
                  >
                    View {venue.images.length} Images
                  </button>
                ) : 'No images available'}
              </dd>
            </dl>
          </article>

          {/* Card 2: Operations & Pricing */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><Users size={18} className="text-admin-red" /> Operations & Pricing</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Capacity</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.capacity ? `${venue.capacity} guests` : 'Not specified'}</dd>
              <dt className="text-muted text-xs">Price</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.price != null ? `₹${venue.price.toLocaleString()}` : 'Not specified'}</dd>
              <dt className="text-muted text-xs">Booking Model</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.bookingModel ? venue.bookingModel.charAt(0).toUpperCase() + venue.bookingModel.slice(1) : 'Not specified'}</dd>
              {venue.bookingConfig?.openingTime && (
                <>
                  <dt className="text-muted text-xs">Operating Hours</dt>
                  <dd className="m-0 font-extrabold text-ink text-sm">{venue.openingTime || venue.bookingConfig.openingTime} – {venue.closingTime || venue.bookingConfig.closingTime}</dd>
                </>
              )}
            </dl>
          </article>

          {/* Card 3: Owner Details */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><User size={18} className="text-admin-red" /> Owner Details</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Name</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.vendor?.fullName || venue.vendor?.firstName || 'Not specified'}</dd>
              <dt className="text-muted text-xs">Email</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">
                {venue.vendor?.email || venue.vendor?.accountEmail ? (
                  <a href={`mailto:${venue.vendor?.email || venue.vendor?.accountEmail}`} className="text-admin-red hover:underline">
                    {venue.vendor?.email || venue.vendor?.accountEmail}
                  </a>
                ) : 'Not provided'}
              </dd>
              <dt className="text-muted text-xs">Phone</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">
                {venue.vendor?.phone ? (
                  <a href={`tel:${venue.vendor?.phone}`} className="text-admin-red hover:underline">{venue.vendor?.phone}</a>
                ) : 'Not provided'}
              </dd>
            </dl>
          </article>

          {/* Card 4: Location Details */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><MapPin size={18} className="text-admin-red" /> Location Details</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Address</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.location?.address || 'Not provided'}</dd>
              <dt className="text-muted text-xs">City</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.location?.city || 'Not provided'}</dd>
              <dt className="text-muted text-xs">State</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.location?.state || 'Not provided'}</dd>
              <dt className="text-muted text-xs">Pincode</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.location?.pincode || 'Not provided'}</dd>
            </dl>
          </article>

          {/* Card 5: Amenities & Rules */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><List size={18} className="text-admin-red" /> Amenities & Rules</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Amenities</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{venue.amenities?.length ? venue.amenities.join(', ') : 'None specified'}</dd>
              <dt className="text-muted text-xs">Rules</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">
                {venue.rules?.length ? (
                  <ul className="pl-5 list-disc m-0">
                    {venue.rules.map((rule, index) => <li key={index}>{rule}</li>)}
                  </ul>
                ) : 'None specified'}
              </dd>
            </dl>
          </article>

          {/* Card 6: Approval Timeline */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink"><Clock size={18} className="text-admin-red" /> Approval Timeline</h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Approval Status</dt>
              <dd className="m-0 font-extrabold text-ink text-sm"><StatusBadge status={approvalStatus} /></dd>
              {approvalStatus === 'approved' && (
                <>
                  <dt className="text-muted text-xs">Visibility Status</dt>
                  <dd className="m-0 font-extrabold text-ink text-sm"><StatusBadge status={venue.venueStatus} /></dd>
                </>
              )}
              {approvalStatus !== 'approved' && venue.approval?.rejectionReason && (
                <>
                  <dt className="text-muted text-xs">Rejection Reason</dt>
                  <dd className="m-0 font-extrabold text-ink text-sm">{venue.approval.rejectionReason}</dd>
                </>
              )}
            </dl>
          </article>
        </div>

        {venue.slots && venue.slots.length > 0 && (
          <section className="bg-surface border border-line rounded-lg shadow-admin mt-5">
            <div className="flex items-center justify-between p-[16px_20px] border-b border-line">
              <h3 className="m-0 text-[15px] font-semibold text-ink">Available Slots</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Date</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Start Time</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">End Time</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Price</th>
                    <th className="p-[16px_12px] text-left text-[#7b6b6b] text-[11px] font-black uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {venue.slots.map((slot) => (
                    <tr key={slot._id} className="hover:bg-panel transition-colors border-b border-line">
                      <td className="p-[16px_12px] text-sm text-ink">{formatDate(slot.date)}</td>
                      <td className="p-[16px_12px] text-sm text-ink">{slot.startTime}</td>
                      <td className="p-[16px_12px] text-sm text-ink">{slot.endTime}</td>
                      <td className="p-[16px_12px] text-sm text-ink">₹{slot.price?.toLocaleString()}</td>
                      <td className="p-[16px_12px]"><StatusBadge status={slot.isBooked ? 'Booked' : 'Available'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="flex items-center justify-between gap-3.5 mt-6 border-t border-line pt-4">
          {['submitted', 'under_review'].includes(approvalStatus) && (
            <>
              <button
                className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-admin-red bg-white border border-[#fecaca] hover:bg-admin-red-soft hover:text-admin-red-dark transition-all"
                type="button"
                onClick={() => setPendingAction({ type: 'reject' })}
              >
                Reject
              </button>
              <button
                className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-white bg-admin-red border border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark transition-all ml-auto"
                type="button"
                onClick={() => setPendingAction({ type: 'approve' })}
              >
                Approve Venue
              </button>
            </>
          )}
          {approvalStatus === 'approved' && (
            <button
              className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold border transition-all ${
                venue.venueStatus === 'active' 
                  ? 'text-admin-red bg-white border-[#fecaca] hover:bg-admin-red-soft hover:text-admin-red-dark' 
                  : 'text-white bg-admin-red border border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark'
              }`}
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
          className="fixed inset-0 bg-black/85 z-[9999] flex flex-col items-center justify-center p-5"
          onClick={() => setIsImageViewerOpen(false)} 
        >
          <button 
            onClick={() => setIsImageViewerOpen(false)} 
            className="absolute top-6 right-8 bg-transparent border-0 text-white text-4xl cursor-pointer hover:text-admin-red transition-colors"
          >
            &times;
          </button>
          
          <img 
            src={venue.images[currentImageIndex].url} 
            alt="Venue image" 
            className="max-w-[90%] max-h-[75vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
          
          {venue.images.length > 1 && (
            <div className="mt-6 flex gap-5 items-center" onClick={(e) => e.stopPropagation()}>
              <button 
                className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-ink bg-white border border-transparent hover:bg-admin-red hover:text-white transition-all"
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? venue.images.length - 1 : prev - 1)}
              >
                Previous
              </button>
              <span className="text-white font-bold text-sm">
                {currentImageIndex + 1} / {venue.images.length}
              </span>
              <button 
                className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-ink bg-white border border-transparent hover:bg-admin-red hover:text-white transition-all"
                onClick={() => setCurrentImageIndex(prev => prev === venue.images.length - 1 ? 0 : prev + 1)}
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
                placeholder="Please explain why this venue is being rejected..."
                className={`w-full p-2.5 rounded-[7px] text-sm text-ink outline-none bg-white border ${
                  formErrors.rejectReason ? 'border-admin-red' : 'border-line hover:border-admin-red focus:border-admin-red'
                } transition-colors`}
              />
              {formErrors.rejectReason && <div className="text-admin-red text-xs mt-1">{formErrors.rejectReason}</div>}
            </div>
          )}
        </ConfirmModal>
      ) : null}
    </div>
  );
}

export default VenueDetails;

