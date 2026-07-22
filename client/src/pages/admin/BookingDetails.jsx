import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Tag, 
  User, 
  Building2, 
  Store, 
  Calendar, 
  Landmark, 
  Clock,
  ShieldAlert,
  Mail,
  Phone,
  MapPin,
  HelpCircle
} from 'lucide-react';
import { getBookingById, cancelBooking } from '../../api/admin-api/adminApi';
import { formatDate } from '../../utils/formatters';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StateBlock from '../../components/admin/StateBlock';
import StatusBadge from '../../components/admin/StatusBadge';
import Toast from '../../components/admin/Toast';

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [pendingAction, setPendingAction] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Disputes');
  const [cancellationDescription, setCancellationDescription] = useState('');
  
  // Operation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState('');

  const loadBooking = async () => {
    setLoading(true);
    try {
      const data = await getBookingById(id);
      setBooking(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handleCancelClick = () => {
    setPendingAction({ type: 'cancel' });
    setCancellationReason('Disputes');
    setCancellationDescription('');
    setFormError('');
  };

  const handleCancelConfirm = async () => {
    if (!cancellationReason) {
      setFormError('Please select a cancellation reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      await cancelBooking(booking._id, {
        cancellationReason,
        cancellationDescription: cancellationDescription.trim(),
      });
      
      setToast({
        type: 'success',
        message: 'Booking has been cancelled successfully.',
      });
      setPendingAction(null);
      await loadBooking();
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to cancel the booking.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <StateBlock title="Loading booking details" message="Fetching reservation details and user records." />;
  }

  if (error || !booking) {
    return (
      <div className="grid gap-6">
        <button 
          onClick={() => navigate('/admin/bookings')}
          className="self-start inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-admin-red transition-colors"
        >
          <ArrowLeft size={16} /> Back to Bookings
        </button>
        <StateBlock title="Unable to load booking" message={error || 'The requested booking could not be found.'} />
      </div>
    );
  }

  const isCancellable = ['Pending', 'Confirmed'].includes(booking.bookingStatus);

  // Address helper for vendor
  const vendorAddressObj = booking.venueId?.vendorId?.profile?.address;
  const vendorAddress = vendorAddressObj
    ? [vendorAddressObj.line1, vendorAddressObj.line2, vendorAddressObj.city, vendorAddressObj.state, vendorAddressObj.pincode, vendorAddressObj.country]
      .filter(Boolean)
      .join(', ')
    : 'N/A';

  // Vendor name helper
  const vendorProfile = booking.venueId?.vendorId?.profile;
  const vendorName = vendorProfile?.fullName || 
    (vendorProfile?.firstName ? `${vendorProfile.firstName} ${vendorProfile.lastName || ''}`.trim() : 'N/A');

  return (
    <div className="grid gap-[26px]">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-[18px]">
        <div className="grid gap-1">
          <button 
            onClick={() => navigate('/admin/bookings')}
            className="self-start inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted hover:text-admin-red transition-colors"
          >
            <ArrowLeft size={14} /> Back to Bookings
          </button>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="m-0 text-3xl font-extrabold text-ink">Booking Details</h1>
            <span className="font-mono text-sm px-2.5 py-1 bg-surface border border-line rounded-md text-muted font-bold">
              ID: {booking._id}
            </span>
          </div>
          <p className="block text-muted text-[12px]">
            Created on {formatDate(booking.createdAt)}
          </p>
        </div>

        {/* Action Button */}
        {isCancellable && (
          <button
            onClick={handleCancelClick}
            disabled={isSubmitting}
            className="min-h-[42px] px-6 rounded-lg text-sm font-extrabold text-white bg-admin-red border border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark transition-all shadow-md self-start sm:self-center"
            type="button"
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side (Booking, Slots, Pricing, Cancellation Info) */}
        <div className="lg:col-span-2 grid gap-6">
          
          {/* Booking Info Card */}
          <article className="bg-surface border border-line rounded-lg shadow-admin p-6">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink border-b border-line pb-3">
              <Tag size={18} className="text-admin-red" /> General Booking Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-5">
              <div>
                <span className="text-muted text-xs font-black uppercase tracking-wider block">Booking Date</span>
                <span className="font-extrabold text-ink text-sm mt-1 block">{formatDate(booking.bookingDate)}</span>
              </div>
              <div>
                <span className="text-muted text-xs font-black uppercase tracking-wider block">Guest Count</span>
                <span className="font-extrabold text-ink text-sm mt-1 block">{booking.guestCount || 0} guests</span>
              </div>
              <div>
                <span className="text-muted text-xs font-black uppercase tracking-wider block">Booking Status</span>
                <div className="mt-1 block">
                  <StatusBadge status={booking.bookingStatus} />
                </div>
              </div>
              <div>
                <span className="text-muted text-xs font-black uppercase tracking-wider block">Payment Status</span>
                <div className="mt-1 block">
                  <StatusBadge status={booking.paymentStatus} />
                </div>
              </div>
            </div>
          </article>

          {/* Slots details */}
          <article className="bg-surface border border-line rounded-lg shadow-admin p-6">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink border-b border-line pb-3">
              <Calendar size={18} className="text-admin-red" /> Booked Slots & Schedule
            </h2>
            <div className="mt-4">
              {booking.slotIds && booking.slotIds.length > 0 ? (
                <div className="grid gap-3">
                  {booking.slotIds.map((slot, index) => (
                    <div 
                      key={slot._id || index} 
                      className="p-3.5 bg-panel border border-line rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-admin-red-soft text-admin-red flex items-center justify-center font-black text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <span className="text-ink text-sm font-extrabold block">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-muted text-xs font-semibold block mt-0.5">
                            Slot Date: {slot.date ? formatDate(slot.date) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-ink text-xs font-bold block sm:inline-block">Price:</span>
                        <span className="text-admin-red text-sm font-black ml-1">
                          ₹{slot.price?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center border border-dashed border-line rounded-lg text-muted text-sm font-semibold">
                  No slots details populated
                </div>
              )}
            </div>
          </article>

          {/* Pricing Breakdown */}
          <article className="bg-surface border border-line rounded-lg shadow-admin p-6">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink border-b border-line pb-3">
              <Landmark size={18} className="text-admin-red" /> Financial Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
              <div className="p-4 bg-panel border border-line rounded-lg">
                <span className="text-muted text-xs font-black uppercase tracking-wider block">Total Amount</span>
                <span className="font-black text-ink text-lg mt-1 block">₹{booking.totalAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="p-4 bg-panel border border-line rounded-lg">
                <span className="text-green text-xs font-black uppercase tracking-wider block">Advance Paid</span>
                <span className="font-black text-green text-lg mt-1 block">₹{booking.advanceAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="p-4 bg-panel border border-line rounded-lg">
                <span className="text-admin-red text-xs font-black uppercase tracking-wider block">Balance Due</span>
                <span className="font-black text-admin-red text-lg mt-1 block">
                  ₹{((booking.totalAmount || 0) - (booking.advanceAmount || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </article>

          {/* Cancellation Info Panel (Shows only if booking is cancelled) */}
          {booking.bookingStatus === 'Cancelled' && (
            <article className="bg-admin-red-soft/30 border border-admin-red-soft/60 rounded-lg p-6 flex gap-4 items-start">
              <div className="p-2.5 bg-admin-red-soft rounded-lg text-admin-red">
                <ShieldAlert size={24} />
              </div>
              <div className="grid gap-1">
                <h3 className="m-0 text-sm font-black uppercase tracking-wider text-admin-red">Cancellation Audit Log</h3>
                <div className="mt-2 text-sm text-ink">
                  <span className="font-bold">Reason Category:</span> {booking.cancellationReason || 'Not Specified'}
                </div>
                <div className="text-sm text-ink mt-1">
                  <span className="font-bold">Explanation:</span> {booking.cancellationDescription || 'No description provided.'}
                </div>
              </div>
            </article>
          )}

        </div>

        {/* Right Side (Customer Info & Venue/Vendor Info) */}
        <div className="grid gap-6">

          {/* Customer Card */}
          <article className="bg-surface border border-line rounded-lg shadow-admin p-6">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink border-b border-line pb-3">
              <User size={18} className="text-admin-red" /> Customer Account
            </h2>
            <div className="grid gap-4 mt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f3f4f6] text-[#4b5563] font-black text-sm flex items-center justify-center">
                  C
                </div>
                <div>
                  <span className="text-ink text-sm font-extrabold block">
                    {booking.userId?.profile?.firstName ? `${booking.userId.profile.firstName} ${booking.userId.profile.lastName || ''}`.trim() : 'N/A'}
                  </span>
                  <span className="text-[11px] text-[#9ca3af] font-bold block uppercase tracking-wider">
                    {booking.userId?.role || 'Customer'}
                  </span>
                </div>
              </div>
              <hr className="border-line my-1" />
              <div className="grid gap-2">
                <div className="flex items-center gap-2.5 text-sm text-ink">
                  <Mail size={15} className="text-muted" />
                  <span className="break-all font-semibold">{booking.userId?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-ink">
                  <Phone size={15} className="text-muted" />
                  <span className="font-semibold">{booking.userId?.profile?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-ink">
                  <Clock size={15} className="text-muted" />
                  <span className="font-semibold">Account: {booking.userId?.isBlocked ? 'Blocked / Suspended' : 'Active'}</span>
                </div>
              </div>
            </div>
          </article>

          {/* Venue & Vendor Info Card */}
          <article className="bg-surface border border-line rounded-lg shadow-admin p-6">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink border-b border-line pb-3">
              <Building2 size={18} className="text-admin-red" /> Venue Information
            </h2>
            <div className="grid gap-4 mt-5">
              <div>
                <span className="text-muted text-xs font-black uppercase tracking-wider block">Venue Name</span>
                <span className="font-extrabold text-ink text-sm mt-0.5 block">{booking.venueId?.name || 'N/A'}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-ink">
                <MapPin size={15} className="text-muted flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{booking.venueId?.location?.address || 'N/A'}</span>
                  <span className="text-muted text-xs block mt-0.5">
                    {booking.venueId?.location?.city ? `${booking.venueId.location.city}, ${booking.venueId.location.state || ''}`.replace(/,\s*$/, '') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink border-y border-line py-3 my-5">
              <Store size={18} className="text-admin-red" /> Vendor Information
            </h2>

            {booking.venueId?.vendorId ? (
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f3f4f6] text-[#4b5563] font-black text-sm flex items-center justify-center">
                    V
                  </div>
                  <div>
                    <span className="text-ink text-sm font-extrabold block">
                      {vendorName}
                    </span>
                    <span className="text-[11px] text-[#9ca3af] font-bold block uppercase tracking-wider">
                      Business Role: {vendorProfile?.roleInBusiness || 'Owner'}
                    </span>
                  </div>
                </div>
                <hr className="border-line my-1" />
                <div className="grid gap-2">
                  <div className="flex items-center gap-2.5 text-sm text-ink">
                    <Mail size={15} className="text-muted" />
                    <span className="break-all font-semibold">{booking.venueId?.vendorId?.email || vendorProfile?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-ink">
                    <Phone size={15} className="text-muted" />
                    <span className="font-semibold">{vendorProfile?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-ink">
                    <MapPin size={15} className="text-muted flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">{vendorAddress}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-ink">
                    <HelpCircle size={15} className="text-muted" />
                    <span className="font-semibold">Onboarding: <span className="capitalize">{vendorProfile?.onboardingStatus || 'N/A'}</span></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-line rounded-lg text-muted text-sm font-semibold">
                No vendor info populated
              </div>
            )}
          </article>

        </div>

      </div>

      {/* Confirm Action Modal for Cancellations */}
      {pendingAction && (
        <ConfirmModal
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be undone and will release all booked slots."
          confirmLabel="Confirm Cancellation"
          danger={true}
          onCancel={() => {
            setPendingAction(null);
            setCancellationReason('Disputes');
            setCancellationDescription('');
            setFormError('');
          }}
          onConfirm={handleCancelConfirm}
        >
          <div className="mt-4 flex flex-col gap-4 text-left">
            {booking.advanceAmount > 0 && (
              <div className="p-3 bg-amber/10 border border-amber/20 rounded-md text-amber text-xs font-semibold">
                Note: An advance payment of ₹{booking.advanceAmount.toLocaleString()} has been made. The payment status will be marked as Refunded.
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Cancellation Reason *</label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="h-[38px] px-3 rounded-[7px] border border-line bg-white text-[13px] text-ink outline-none cursor-pointer focus:border-admin-red transition-colors w-full"
              >
                <option value="Disputes">Disputes</option>
                <option value="Fraud">Fraud</option>
                <option value="Legal issues">Legal issues</option>
                <option value="Emergencies">Emergencies</option>
                <option value="Support intervention">Support intervention</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Additional Remarks / Description</label>
              <textarea
                value={cancellationDescription}
                onChange={(e) => setCancellationDescription(e.target.value)}
                placeholder="Provide context for this cancellation..."
                rows={3}
                className="p-3 rounded-[7px] border border-line bg-white text-[13px] text-ink outline-none focus:border-admin-red transition-colors w-full resize-none"
              />
            </div>

            {formError && (
              <span className="text-xs font-semibold text-admin-red">{formError}</span>
            )}
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}

export default BookingDetails;
