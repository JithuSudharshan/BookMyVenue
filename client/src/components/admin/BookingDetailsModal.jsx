import { useEffect } from 'react';
import { X, User, Calendar, Building2, Tag, Landmark, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatters';

function BookingDetailsModal({ booking, onClose }) {
  useEffect(() => {
    if (booking) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [booking]);

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-20 grid place-items-center p-5 bg-[#27272a]/35" role="presentation" onClick={onClose}>
      <section 
        className="w-full max-w-[720px] max-h-[90vh] overflow-y-auto p-6 bg-white rounded-lg shadow-modal" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b border-line pb-3">
          <div>
            <span className="text-admin-red text-[14px] font-extrabold">Booking Details</span>
            <h2 id="modal-title" className="m-0 mt-1 text-xl font-bold text-ink">{booking._id}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="min-h-[36px] min-w-[36px] h-[36px] w-[36px] p-0 flex items-center justify-center rounded-full text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all" 
            type="button"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-[18px] items-start">
          {/* Booking Information */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink">
              <Tag size={18} className="text-admin-red" /> Booking Information
            </h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Booking ID</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{booking._id}</dd>
              <dt className="text-muted text-xs">Booking Date</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{formatDate(booking.bookingDate)}</dd>
              <dt className="text-muted text-xs">Booking Status</dt>
              <dd className="m-0 font-extrabold text-ink text-sm"><StatusBadge status={booking.bookingStatus} /></dd>
              <dt className="text-muted text-xs">Payment Status</dt>
              <dd className="m-0 font-extrabold text-ink text-sm"><StatusBadge status={booking.paymentStatus} /></dd>
            </dl>
          </article>

          {/* Customer Information */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink">
              <User size={18} className="text-admin-red" /> Customer Account
            </h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Name</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{booking.userId?.profile?.firstName ? `${booking.userId.profile.firstName} ${booking.userId.profile.lastName || ''}` : 'N/A'}</dd>
              <dt className="text-muted text-xs">Email</dt>
              <dd className="m-0 font-extrabold text-ink text-sm break-all">{booking.userId?.email || 'N/A'}</dd>
              <dt className="text-muted text-xs">Phone</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{booking.userId?.profile?.phone || 'N/A'}</dd>
              <dt className="text-muted text-xs">Status</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{booking.userId?.isBlocked ? 'Suspended' : 'Active'}</dd>
            </dl>
          </article>

          {/* Venue Information */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin md:col-span-2">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink">
              <Building2 size={18} className="text-admin-red" /> Venue Information
            </h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Venue Name</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{booking.venueId?.name || 'N/A'}</dd>
              <dt className="text-muted text-xs">City / State</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{booking.venueId?.location?.city ? `${booking.venueId.location.city}, ${booking.venueId.location.state || ''}`.replace(/,\s*$/, '') : 'N/A'}</dd>
              <dt className="text-muted text-xs">Full Address</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{booking.venueId?.location?.address || 'N/A'}</dd>
            </dl>
          </article>

          {/* Booked Slots */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin md:col-span-2">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink">
              <Calendar size={18} className="text-admin-red" /> Booked Slots & Guests
            </h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-muted text-xs">Guest Count</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">{booking.guestCount || 0} guests</dd>
            </dl>
            <div className="mt-3">
              <strong className="text-[13px] text-muted font-bold">Slots:</strong>
              {booking.slotIds && booking.slotIds.length > 0 ? (
                <ul className="m-0 mt-1 pl-5 text-[13px] list-disc text-ink">
                  {booking.slotIds.map((slot, index) => (
                    <li key={slot._id || index} className="mb-1">
                      {typeof slot === 'object' ? (
                        <>
                          <strong className="font-bold">Slot {index + 1}:</strong> {slot.startTime} - {slot.endTime} ({slot.date ? formatDate(slot.date) : 'N/A'}) - Price: ₹{slot.price?.toLocaleString()}
                        </>
                      ) : (
                        <>Slot ID: {slot}</>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-[13px] text-muted block mt-1">No slots details populated</span>
              )}
            </div>
          </article>

          {/* Pricing Breakdown */}
          <article className="p-[18px_20px] bg-surface border border-line rounded-lg shadow-admin md:col-span-2">
            <h2 className="m-0 text-lg font-bold flex items-center gap-2 text-ink">
              <Landmark size={18} className="text-admin-red" /> Pricing Details
            </h2>
            <dl className="grid grid-cols-[max-content_1fr] gap-[10px_20px] mt-3.5">
              <dt className="text-ink text-xs font-bold">Total Amount</dt>
              <dd className="m-0 font-extrabold text-ink text-sm">₹{booking.totalAmount?.toLocaleString() || 0}</dd>
              <dt className="text-green text-xs font-bold">Advance Paid</dt>
              <dd className="m-0 font-extrabold text-green text-sm">₹{booking.advanceAmount?.toLocaleString() || 0}</dd>
              <dt className="text-admin-red text-xs font-bold">Balance Due</dt>
              <dd className="m-0 font-extrabold text-admin-red text-sm">₹{((booking.totalAmount || 0) - (booking.advanceAmount || 0)).toLocaleString()}</dd>
            </dl>
          </article>

        </div>

        <div className="flex items-center justify-end gap-3.5 mt-6 border-t border-line pt-3">
          <button className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-white bg-admin-red border border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark transition-all" type="button" onClick={onClose}>
            Close details
          </button>
        </div>
      </section>
    </div>
  );
}

export default BookingDetailsModal;
