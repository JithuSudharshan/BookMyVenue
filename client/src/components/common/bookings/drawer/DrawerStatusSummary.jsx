import React from 'react';
import { StatusBadge, BOOKING_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '../BookingBadges';

const MetaCard = ({ label, value }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col items-start justify-center">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
    <div className="text-sm font-medium text-gray-900">{value}</div>
  </div>
);

const DrawerStatusSummary = ({ booking }) => {
  if (!booking) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetaCard 
        label="Booking Status" 
        value={<StatusBadge status={booking.bookingStatus} styleMap={BOOKING_STATUS_STYLES} />} 
      />
      <MetaCard 
        label="Payment Status" 
        value={<StatusBadge status={booking.paymentStatus} styleMap={PAYMENT_STATUS_STYLES} />} 
      />
      <MetaCard 
        label="Booking Type" 
        value={<span className="capitalize px-2 py-0.5 bg-gray-100 rounded-md text-xs">{booking.bookingMode}</span>} 
      />
      <MetaCard 
        label="Guests" 
        value={`${booking.guestCount} Guests`} 
      />
    </div>
  );
};

export default DrawerStatusSummary;
