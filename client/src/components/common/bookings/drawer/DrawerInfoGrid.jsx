import React from 'react';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const DrawerInfoGrid = ({ booking }) => {
  if (!booking) return null;

  let durationText = '';
  if (booking.bookingMode === 'hourly') {
    durationText = `${booking.fromTime || ''} – ${booking.toTime || ''}`;
  } else {
    durationText = 'Full Day(s)';
  }

  return (
    <section className="bg-white border border-gray-100/80 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] rounded-xl p-5 h-full">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
        Booking Information
      </h3>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Booking ID</p>
          <p className="text-sm font-semibold text-gray-900 font-mono">#{booking.bookingNumber}</p>
        </div>
        
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Booked On</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(booking.createdAt)}</p>
        </div>
        
        <div className="col-span-2 h-px bg-gray-50 my-1"></div>
        
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Booking Mode</p>
          <p className="text-sm font-semibold text-gray-900 capitalize">{booking.bookingMode}</p>
        </div>
        
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Guest Count</p>
          <p className="text-sm font-semibold text-gray-900">{booking.guestCount}</p>
        </div>
        
        <div className="col-span-2 h-px bg-gray-50 my-1"></div>
        
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Duration</p>
          <p className="text-sm font-semibold text-gray-900">{durationText}</p>
        </div>
        
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Platform Fee</p>
          <p className="text-sm font-semibold text-gray-900">₹{booking.pricing?.platformFee || 0}</p>
        </div>
      </div>
    </section>
  );
};

export default DrawerInfoGrid;
