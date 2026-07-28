import React from 'react';
import { CalendarDays, Clock, Users, Zap } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const DrawerQuickOverview = ({ booking }) => {
  if (!booking) return null;

  let durationText = '';
  if (booking.bookingMode === 'hourly') {
    durationText = `${booking.fromTime || ''} – ${booking.toTime || ''}`;
  } else {
    durationText = 'Full Day';
  }

  const dateText = booking.bookingMode === 'hourly' 
    ? formatDate(booking.date) 
    : `${formatDate(booking.startDate)} ${booking.startDate !== booking.endDate ? `→ ${formatDate(booking.endDate)}` : ''}`;

  return (
    <div className="flex flex-wrap items-center gap-6 bg-white border border-gray-100/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-xl px-5 py-3 mb-6">
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <CalendarDays className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
          <p className="text-xs font-semibold text-gray-900">{dateText}</p>
        </div>
      </div>

      <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Duration</p>
          <p className="text-xs font-semibold text-gray-900">{durationText}</p>
        </div>
      </div>

      <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Guests</p>
          <p className="text-xs font-semibold text-gray-900">{booking.guestCount}</p>
        </div>
      </div>

      <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Type</p>
          <p className="text-xs font-semibold text-gray-900 capitalize">{booking.bookingMode}</p>
        </div>
      </div>

    </div>
  );
};

export default DrawerQuickOverview;
