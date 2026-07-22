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
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section 
        className="confirm-modal" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        style={{ width: 'min(720px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.75rem' }}>
          <div>
            <span className="page-kicker">Booking Details</span>
            <h2 id="modal-title" style={{ margin: '4px 0 0 0' }}>{booking._id}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="secondary-button" 
            style={{ minWidth: '36px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', height: '36px' }}
            type="button"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="detail-grid">
          {/* Booking Information */}
          <article className="detail-card">
            <h2>
              <Tag size={18} /> Booking Information
            </h2>
            <dl>
              <dt>Booking ID</dt>
              <dd>{booking._id}</dd>
              <dt>Booking Date</dt>
              <dd>{formatDate(booking.bookingDate)}</dd>
              <dt>Booking Status</dt>
              <dd><StatusBadge status={booking.bookingStatus} /></dd>
              <dt>Payment Status</dt>
              <dd><StatusBadge status={booking.paymentStatus} /></dd>
            </dl>
          </article>

          {/* Customer Information */}
          <article className="detail-card">
            <h2>
              <User size={18} /> Customer Account
            </h2>
            <dl>
              <dt>Name</dt>
              <dd>{booking.userId?.profile?.firstName ? `${booking.userId.profile.firstName} ${booking.userId.profile.lastName || ''}` : 'N/A'}</dd>
              <dt>Email</dt>
              <dd style={{ wordBreak: 'break-all' }}>{booking.userId?.email || 'N/A'}</dd>
              <dt>Phone</dt>
              <dd>{booking.userId?.profile?.phone || 'N/A'}</dd>
              <dt>Status</dt>
              <dd>{booking.userId?.isBlocked ? 'Suspended' : 'Active'}</dd>
            </dl>
          </article>

          {/* Venue Information */}
          <article className="detail-card" style={{ gridColumn: '1 / -1' }}>
            <h2>
              <Building2 size={18} /> Venue Information
            </h2>
            <dl>
              <dt>Venue Name</dt>
              <dd>{booking.venueId?.name || 'N/A'}</dd>
              <dt>City / State</dt>
              <dd>{booking.venueId?.location?.city ? `${booking.venueId.location.city}, ${booking.venueId.location.state || ''}`.replace(/,\s*$/, '') : 'N/A'}</dd>
              <dt>Full Address</dt>
              <dd>{booking.venueId?.location?.address || 'N/A'}</dd>
            </dl>
          </article>

          {/* Booked Slots */}
          <article className="detail-card" style={{ gridColumn: '1 / -1' }}>
            <h2>
              <Calendar size={18} /> Booked Slots & Guests
            </h2>
            <dl>
              <dt>Guest Count</dt>
              <dd>{booking.guestCount || 0} guests</dd>
            </dl>
            <div style={{ marginTop: '12px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--muted)' }}>Slots:</strong>
              {booking.slotIds && booking.slotIds.length > 0 ? (
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '1.25rem', fontSize: '13px' }}>
                  {booking.slotIds.map((slot, index) => (
                    <li key={slot._id || index} style={{ marginBottom: '4px' }}>
                      {typeof slot === 'object' ? (
                        <>
                          <strong>Slot {index + 1}:</strong> {slot.startTime} - {slot.endTime} ({slot.date ? formatDate(slot.date) : 'N/A'}) - Price: ₹{slot.price?.toLocaleString()}
                        </>
                      ) : (
                        <>Slot ID: {slot}</>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>No slots details populated</span>
              )}
            </div>
          </article>

          {/* Pricing Breakdown */}
          <article className="detail-card" style={{ gridColumn: '1 / -1' }}>
            <h2>
              <Landmark size={18} /> Pricing Details
            </h2>
            <dl>
              <dt style={{ color: 'var(--ink)' }}>Total Amount</dt>
              <dd>₹{booking.totalAmount?.toLocaleString() || 0}</dd>
              <dt style={{ color: 'var(--green)' }}>Advance Paid</dt>
              <dd style={{ color: 'var(--green)' }}>₹{booking.advanceAmount?.toLocaleString() || 0}</dd>
              <dt style={{ color: 'var(--admin-red)' }}>Balance Due</dt>
              <dd style={{ color: 'var(--admin-red)' }}>₹{((booking.totalAmount || 0) - (booking.advanceAmount || 0)).toLocaleString()}</dd>
            </dl>
          </article>

        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--line)', paddingTop: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="primary-button" type="button" onClick={onClose}>
            Close details
          </button>
        </div>
      </section>
    </div>
  );
}

export default BookingDetailsModal;
