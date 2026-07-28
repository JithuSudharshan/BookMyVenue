import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Lock } from 'lucide-react';

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
      const isToday = cellDate.getTime() === today.getTime();
      const isPast = cellDate < today;
      const isSelected = selectedDates.includes(dateStr);
      const isStartSelection = selectedDates.length > 0 && selectedDates[0] === dateStr;
      const isEndSelection = selectedDates.length > 1 && selectedDates[selectedDates.length - 1] === dateStr;
      const isMiddleSelection = isSelected && !isStartSelection && !isEndSelection;
      
      const override = overrides.find(o => o.date === dateStr);
      
      let cellClass = "relative h-12 flex flex-col justify-center items-center transition-colors text-sm font-medium ";
      let contentClass = "w-9 h-9 flex items-center justify-center rounded-full relative z-10 ";
      let wrapperClass = "w-full h-full flex justify-center items-center relative ";
      
      let indicator = null;
      
      const isBooked = !isPast && override?.isFullDayBlocked && override?.fullDayReason === 'Customer Booking';
      const isBlocked = !isPast && override?.isFullDayBlocked && override?.fullDayReason !== 'Customer Booking';
      const hasPartialBlock = !isPast && !override?.isFullDayBlocked && override?.blockedSlots?.length > 0;
      const isTooEarlyForDaily = bookingModel === 'daily' && isToday;
      
      const disabled = isPast || isBlocked || isBooked || isTooEarlyForDaily;

      if (isPast || isTooEarlyForDaily) {
        cellClass += "opacity-30 cursor-not-allowed ";
      } else if (isBlocked) {
        cellClass += "cursor-not-allowed bg-red-50/30 ";
        contentClass += "text-red-400 line-through ";
      } else if (isBooked) {
        cellClass += "cursor-not-allowed bg-blue-50/40 ";
        contentClass += "text-blue-500 ";
        indicator = <Lock size={12} className="text-blue-400 absolute bottom-1" />;
      } else {
        cellClass += "cursor-pointer hover:bg-gray-50 ";
      }
      
      if (isToday && !isSelected) {
        contentClass += "ring-1 ring-gray-400 ";
      }
      
      if (isSelected) {
        contentClass += "bg-primary text-white font-bold ";
        
        if (bookingModel === 'daily' && selectedDates.length > 1) {
          if (isStartSelection) {
            wrapperClass += "bg-gradient-to-r from-transparent 50% to-primary/10 ";
          } else if (isEndSelection) {
            wrapperClass += "bg-gradient-to-l from-transparent 50% to-primary/10 ";
          } else if (isMiddleSelection) {
            wrapperClass += "bg-primary/10 ";
            contentClass = contentClass.replace("bg-primary text-white ", "text-primary ");
          }
        }
      } else if (!disabled) {
        contentClass += "text-gray-700 ";
      }
      
      // Partial blocks for hourly
      if (bookingModel === 'hourly' && hasPartialBlock && !isSelected) {
        indicator = <div className="absolute bottom-1 w-1 h-1 rounded-full bg-yellow-400"></div>;
      }

      cells.push(
        <div key={d} onClick={() => !disabled && onDateClick(dateStr)} className={cellClass}>
           <div className={wrapperClass}>
             <span className={contentClass}>{d}</span>
             {indicator}
           </div>
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
      {bookingModel === 'daily' ? (
        <div className="flex flex-col border-t border-outline-variant bg-surface-container-lowest">
          <div className="p-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-on-surface-variant">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full ring-1 ring-gray-400 bg-white"></div> Today (Unavailable)</div>
            <div className="flex items-center gap-1.5"><Lock size={10} className="text-blue-500" /> Booked</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-50/50 border border-red-200"></div> Blocked</div>
          </div>
          <div className="pb-3 px-3 text-center text-xs text-on-surface-variant italic">
            Daily bookings must be reserved at least one day in advance.
          </div>
        </div>
      ) : (
        <div className="p-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-on-surface-variant border-t border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full ring-1 ring-gray-400 bg-white"></div> Today</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Partially Blocked</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-50/50 border border-red-200"></div> Fully Blocked</div>
          <div className="flex items-center gap-1.5"><Lock size={10} className="text-blue-500" /> Fully Booked</div>
        </div>
      )}
    </div>
  );
};

export default CompactCalendar;
