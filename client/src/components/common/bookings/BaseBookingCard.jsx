import React, { memo } from 'react';
import { MapPin } from 'lucide-react';
import BookingImage from './BookingImage';
import { StatusBadge, BOOKING_STATUS_STYLES, PAYMENT_STATUS_STYLES } from './BookingBadges';
import BookingMeta from './BookingMeta';
import BookingAmountSummary from './BookingAmountSummary';

const BaseBookingCard = memo(({ 
  booking, 
  headerActions,
  footerActions,
  extraInformation,
  statusSection
}) => {
  const venue = booking.venue || {};
  const venueName = venue.name || 'Unknown Venue';
  const city = venue.location?.city || '';
  // Customer portal has images array, Vendor portal has primaryImage. Handle both safely.
  const image = venue.primaryImage || (venue.images && venue.images[0]?.url) || null;

  const paymentLabel = {
    completed: 'Paid',
    partial: 'Advance Paid',
    pending: 'Pending',
    refunded: 'Refunded',
  }[booking.paymentStatus?.toLowerCase()] || booking.paymentStatus;

  const bookingLabel = booking.bookingStatus?.charAt(0).toUpperCase() + booking.bookingStatus?.slice(1);

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden">
      <div className="flex gap-0 flex-col sm:flex-row">
        
        {/* Left Side: Venue Image */}
        <BookingImage imageUrl={image} venueName={venueName} />

        {/* Right Side: Content */}
        <div className="flex-1 min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            
            {/* Top Left: Venue Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{venueName}</h3>
                {city && (
                  <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                    <MapPin className="w-3 h-3" />{city}
                  </span>
                )}
              </div>
              
              {/* Optional: Vendor might want bookingNumber, Customer might not care. Passed via extraInformation slot */}
              {extraInformation}
            </div>

            {/* Top Right: Status Badges or Custom Status Section */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {statusSection ? statusSection : (
                <>
                  <StatusBadge status={booking.bookingStatus} styleMap={BOOKING_STATUS_STYLES} label={bookingLabel} />
                  <StatusBadge status={booking.paymentStatus} styleMap={PAYMENT_STATUS_STYLES} label={paymentLabel} />
                </>
              )}
            </div>
            
            {/* Optional Header Actions (like Context Menus) */}
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>

          {/* Middle: Booking Metadata */}
          <BookingMeta booking={booking} />

          {/* Footer: Price Summary + Action Slot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-50 gap-3">
            <BookingAmountSummary pricing={booking.pricing} />
            
            {footerActions && (
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {footerActions}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
});

BaseBookingCard.displayName = 'BaseBookingCard';

export default BaseBookingCard;
