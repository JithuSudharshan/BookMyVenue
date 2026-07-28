import React from 'react';
import { X } from 'lucide-react';
import { StatusBadge, BOOKING_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '../BookingBadges';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const DrawerHeader = ({ booking, onClose }) => {
  if (!booking) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h2 className="text-lg md:text-xl font-bold font-mono text-gray-900">
            #{booking.bookingNumber}
          </h2>
          <StatusBadge status={booking.bookingStatus} styleMap={BOOKING_STATUS_STYLES} />
          <StatusBadge status={booking.paymentStatus} styleMap={PAYMENT_STATUS_STYLES} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Created on {formatDate(booking.createdAt)}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors flex-shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DrawerHeader;
