import React from 'react';

const AvailabilityRow = ({ startTime, endTime, status, onClick }) => {
  let rowClass = "w-full text-left py-4 px-5 rounded-lg border transition-all flex items-center justify-between group";
  let borderClass = "";
  let badgeClass = "text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5";
  let badgeLabel = "";
  let badgeDot = "";

  if (status === 'blocked') {
    rowClass += " bg-amber-50/50 border-amber-200 hover:bg-amber-50 cursor-pointer";
    borderClass = "border-l-4 border-l-amber-400";
    badgeClass += " bg-amber-100 text-amber-700";
    badgeLabel = "Blocked";
    badgeDot = "bg-amber-500";
  } else if (status === 'customer_booking') {
    rowClass += " bg-blue-50/30 border-blue-100 cursor-not-allowed opacity-90";
    borderClass = "border-l-4 border-l-blue-400";
    badgeClass += " bg-blue-100 text-blue-700";
    badgeLabel = "Booked";
    badgeDot = "bg-blue-500";
  } else if (status === 'available') {
    rowClass += " bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer";
    borderClass = "border-l-4 border-l-emerald-400";
    badgeClass += " bg-emerald-50 text-emerald-700";
    badgeLabel = "Open";
    badgeDot = "bg-emerald-500";
  } else if (status === 'selected') {
    rowClass += " bg-gray-50 border-gray-900 cursor-pointer";
    borderClass = "border-l-4 border-l-gray-900";
    badgeClass += " bg-gray-200 text-gray-800";
    badgeLabel = "Selected";
    badgeDot = "bg-gray-700";
  } else if (status === 'disabled') {
    rowClass += " bg-gray-50 border-gray-100 cursor-not-allowed";
    borderClass = "border-l-4 border-l-gray-300";
    badgeClass += " bg-gray-200 text-gray-500";
    badgeLabel = "Unavailable";
    badgeDot = "bg-gray-400";
  }

  // Format times nicely if possible (e.g., 09:00 -> 09:00 AM)
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formattedStart = formatTime(startTime);
  const formattedEnd = formatTime(endTime);

  return (
    <button
      onClick={status !== 'disabled' && status !== 'customer_booking' ? onClick : undefined}
      className={`${rowClass} ${borderClass}`}
      type="button"
    >
      <span className="font-bold text-gray-900 tracking-tight text-[15px]">
        {formattedStart} – {formattedEnd}
      </span>
      <div className={badgeClass}>
        <div className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} />
        {badgeLabel}
      </div>
    </button>
  );
};

export default AvailabilityRow;
