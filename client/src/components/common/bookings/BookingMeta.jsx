import React from 'react';
import { CalendarDays, Clock, Users } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const BookingMeta = ({ booking }) => {
  const dateDisplay = booking.bookingMode === 'hourly'
    ? formatDate(booking.date)
    : `${formatDate(booking.startDate)}${booking.startDate !== booking.endDate ? ` → ${formatDate(booking.endDate)}` : ''}`;

  const timeDisplay = booking.bookingMode === 'hourly' && booking.fromTime
    ? `${booking.fromTime} – ${booking.toTime}`
    : null;

  return (
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
  );
};

export default BookingMeta;
