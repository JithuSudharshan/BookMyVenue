import React, { memo } from 'react';
import { CalendarDays, Clock, Users, MapPin, Eye } from 'lucide-react';

const formatCurrency = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const BOOKING_STATUS_STYLES = {
  confirmed:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  completed:  { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  cancelled:  { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
  refunded:   { bg: 'bg-gray-100',   text: 'text-gray-600',    dot: 'bg-gray-400' },
  refund_pending: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
};

const PAYMENT_STATUS_STYLES = {
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  partial:   { bg: 'bg-amber-50',   text: 'text-amber-700' },
  pending:   { bg: 'bg-gray-100',   text: 'text-gray-600' },
  refunded:  { bg: 'bg-blue-50',    text: 'text-blue-600' },
};

const StatusBadge = ({ status, styleMap, label }) => {
  const style = styleMap[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {label || status}
    </span>
  );
};

const BookingCard = memo(({ booking, onViewDetails }) => {
  const venue = booking.venueId || {};
  const venueName = venue.name || 'Unknown Venue';
  const city = venue.location?.city || '';
  const image = venue.images?.find(i => i.isPrimary)?.url || venue.images?.[0]?.url;

  const dateDisplay = booking.bookingMode === 'hourly'
    ? formatDate(booking.date)
    : `${formatDate(booking.startDate)}${booking.startDate !== booking.endDate ? ` → ${formatDate(booking.endDate)}` : ''}`;

  const timeDisplay = booking.bookingMode === 'hourly' && booking.fromTime
    ? `${booking.fromTime} – ${booking.toTime}`
    : null;

  const paymentLabel = {
    completed: 'Paid',
    partial: 'Advance Paid',
    pending: 'Pending',
    refunded: 'Refunded',
  }[booking.paymentStatus] || booking.paymentStatus;

  const bookingLabel = booking.bookingStatus?.charAt(0).toUpperCase() + booking.bookingStatus?.slice(1);

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden">
      <div className="flex gap-0">
        {/* Venue Image */}
        {image ? (
          <div className="hidden sm:block w-28 flex-shrink-0">
            <img src={image} alt={venueName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="hidden sm:flex w-28 flex-shrink-0 items-center justify-center bg-gray-50">
            <MapPin className="w-6 h-6 text-gray-300" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            {/* Left: venue + booking meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{venueName}</h3>
                {city && (
                  <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                    <MapPin className="w-3 h-3" />{city}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono">#{booking.bookingNumber}</p>
            </div>

            {/* Right: status badges */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <StatusBadge status={booking.bookingStatus} styleMap={BOOKING_STATUS_STYLES} label={bookingLabel} />
              <StatusBadge status={booking.paymentStatus} styleMap={PAYMENT_STATUS_STYLES} label={paymentLabel} />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              {dateDisplay}
            </span>
            {timeDisplay && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {timeDisplay}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {booking.guestCount} Guests
            </span>
            <span className="text-xs font-medium px-2 py-0.5 bg-gray-50 text-gray-600 rounded-lg capitalize">
              {booking.bookingMode}
            </span>
          </div>

          {/* Footer: price + action */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Total</p>
                <p className="font-semibold text-gray-900 text-sm">₹{formatCurrency(booking.pricing?.totalAmount)}</p>
              </div>
              {booking.pricing?.remainingAmount > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Balance Due</p>
                  <p className="font-semibold text-amber-600 text-sm">₹{formatCurrency(booking.pricing?.remainingAmount)}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => onViewDetails(booking)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-primary hover:text-white rounded-xl transition-all group-hover:bg-primary group-hover:text-white"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

BookingCard.displayName = 'BookingCard';

export default BookingCard;
