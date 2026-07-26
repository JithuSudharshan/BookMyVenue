import React from 'react';

const TimeSlotPill = ({ startTime, endTime, status, title, subtitle, onClick }) => {
  let buttonClass = "py-2 px-2 text-sm font-medium rounded-lg border transition-all flex flex-col items-center justify-center gap-1 w-full";
  let displayTitle = title;

  if (status === 'blocked') {
    buttonClass += " bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 cursor-pointer";
    displayTitle = displayTitle || "Blocked (Click to unblock)";
  } else if (status === 'customer_booking') {
    buttonClass += " bg-blue-50 text-blue-700 border-blue-200 cursor-not-allowed opacity-90";
    displayTitle = displayTitle || "Customer Booking";
  } else if (status === 'available') {
    buttonClass += " bg-white text-gray-700 border-gray-200 hover:border-gray-900 hover:bg-gray-50 cursor-pointer";
    displayTitle = displayTitle || "Available";
  } else if (status === 'selected') {
    buttonClass += " bg-gray-900 text-white border-gray-900 cursor-pointer";
    displayTitle = displayTitle || "Selected";
  } else if (status === 'disabled') {
    buttonClass += " bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed";
    displayTitle = displayTitle || "Unavailable";
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
      title={displayTitle}
      onClick={status !== 'disabled' && status !== 'customer_booking' ? onClick : undefined}
      className={buttonClass}
      type="button"
    >
      <span className="whitespace-nowrap">{formattedStart} - {formattedEnd}</span>
      {subtitle && (
        <span className={`text-[9px] leading-none uppercase font-bold truncate w-full text-center ${status === 'blocked' ? 'text-red-500' : status === 'customer_booking' ? 'text-blue-600' : 'text-gray-500'}`}>
          {subtitle}
        </span>
      )}
    </button>
  );
};

export default TimeSlotPill;
