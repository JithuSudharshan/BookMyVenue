import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CompactCalendar = ({
  year,
  month,
  overrides = [],
  bookingModel,
  selectedDates = [],
  onDateClick,
  onMonthChange
}) => {
  const handlePrevMonth = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOfMonth = (y, m) => {
    let day = new Date(y, m - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-1 border border-transparent"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const cellDate = new Date(year, month - 1, d);
      const isPast = cellDate < today;
      const isSelected = selectedDates.includes(dateStr);
      
      const override = overrides.find(o => o.date === dateStr);
      
      let indicator = null;
      let dotColor = 'bg-green-500'; // free
      
      if (isPast) {
        dotColor = 'bg-gray-300';
      } else if (override?.isFullDayBlocked) {
        dotColor = override.fullDayReason === 'Customer Booking' ? 'bg-blue-500' : 'bg-red-500';
      }
      
      if (bookingModel === 'daily') {
        indicator = <div className={`w-1.5 h-1.5 rounded-full mx-auto ${dotColor}`}></div>;
      }

      // If hourly, we don't show dots, just plain dates
      // BUT we still want to grey out past dates
      const isBlocked = !isPast && override?.isFullDayBlocked;
      const disabled = isPast || isBlocked;

      cells.push(
        <div
          key={d}
          onClick={() => !disabled && onDateClick(dateStr)}
          className={`h-12 p-1 border border-gray-100 flex flex-col justify-center items-center transition-colors
            ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}
            ${isSelected ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}
          `}
        >
          <span className={`text-sm mb-1 ${isSelected ? 'text-primary font-bold' : 'text-gray-700'}`}>{d}</span>
          {indicator}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm w-full">
      <div className="flex items-center justify-between p-3 border-b border-outline-variant bg-surface-container-lowest">
        <button onClick={handlePrevMonth} className="p-1.5 rounded-md hover:bg-surface-variant text-on-surface-variant">
          <FiChevronLeft size={18} />
        </button>
        <h3 className="text-base font-semibold text-on-surface">
          {monthNames[month - 1]} {year}
        </h3>
        <button onClick={handleNextMonth} className="p-1.5 rounded-md hover:bg-surface-variant text-on-surface-variant">
          <FiChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center border-b border-outline-variant bg-surface-container-lowest">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
          <div key={day} className="py-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {renderCells()}
      </div>
      {bookingModel === 'daily' && (
        <div className="p-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-on-surface-variant border-t border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Booked</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Blocked</div>
        </div>
      )}
    </div>
  );
};

export default CompactCalendar;
