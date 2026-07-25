import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const MonthlyCalendarGrid = ({
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
    // Adjust so Monday is 0, Sunday is 6
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderCells = () => {
    const cells = [];
    // Fill empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const cellDate = new Date(year, month - 1, d);
      const isPast = cellDate < today;
      const isSelected = selectedDates.includes(dateStr);
      
      const override = overrides.find(o => o.date === dateStr);
      
      let indicator = null;
      if (bookingModel === 'daily') {
        let dotColor = 'bg-green-500 border border-green-500'; // free
        if (isPast) dotColor = 'bg-gray-300 border-none';
        else if (override?.isFullDayBlocked) {
          dotColor = override.fullDayReason === 'Customer Booking' ? 'bg-blue-500 border-blue-500' : 'bg-red-500 border-red-500';
        }
        indicator = <div className={`w-3 h-3 rounded-full mt-2 mx-auto ${dotColor}`}></div>;
      } else {
        // hourly
        const count = override?.blockedSlots?.length || 0;
        if (count > 0) {
          indicator = <div className="mt-1 mx-auto bg-dark text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit">{count} blocked</div>;
        }
      }

      cells.push(
        <div
          key={d}
          onClick={() => !isPast && onDateClick(dateStr)}
          className={`h-24 p-2 border border-gray-100 flex flex-col items-center transition-colors
            ${isPast ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}
            ${isSelected ? 'ring-2 ring-dark ring-inset bg-gray-50' : ''}
          `}
        >
          <span className={`text-sm font-medium ${isSelected ? 'text-dark font-bold' : 'text-gray-700'}`}>{d}</span>
          {indicator}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-200 text-gray-600">
          <FiChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold text-dark">
          {monthNames[month - 1]} {year}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-200 text-gray-600">
          <FiChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center border-b border-gray-200 bg-gray-50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {renderCells()}
      </div>
      {bookingModel === 'daily' && (
        <div className="p-4 flex gap-4 text-xs text-gray-500 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500 border border-green-500"></div> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Customer Booking</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Blocked</div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCalendarGrid;
