import React from 'react';
import { useBooking } from '../../../store/BookingContext';
import { toast } from 'sonner';

const SlotSelector = ({ availableStartTimes, hourlyConfig }) => {
  const { fromTime, setFromTime, toTime, setToTime } = useBooking();

  const handleSlotClick = (time, endTime) => {
    if (!fromTime) {
      // First selection
      setFromTime(time);
      setToTime(endTime);
      return;
    }

    if (fromTime && toTime) {
      // Check if clicking an adjacent slot to extend
      if (time === toTime) {
        // Extending forward
        setToTime(endTime);
      } else if (endTime === fromTime) {
        // Extending backward
        setFromTime(time);
      } else if (time === fromTime && endTime === toTime) {
        // Deselect single slot
        setFromTime('');
        setToTime('');
      } else {
        // Not contiguous - reset and start new selection
        toast.info('Selections must be continuous. Starting new selection.');
        setFromTime(time);
        setToTime(endTime);
      }
    }
  };

  const isSlotSelected = (time, endTime) => {
    if (!fromTime || !toTime) return false;
    return time >= fromTime && endTime <= toTime;
  };

  if (!availableStartTimes || availableStartTimes.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">
        No available times for this date.
      </div>
    );
  }

  return (
    <div className="py-4 border-t border-outline-variant">
      <h4 className="text-sm font-semibold text-on-surface mb-3">Available Times</h4>
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {availableStartTimes.map(time => {
          const [h, m] = time.split(':').map(Number);
          const interval = hourlyConfig?.interval || 60;
          const nextMin = h * 60 + m + interval;
          const endH = Math.floor(nextMin / 60).toString().padStart(2, '0');
          const endM = (nextMin % 60).toString().padStart(2, '0');
          const endTime = `${endH}:${endM}`;
          
          const selected = isSlotSelected(time, endTime);
          
          return (
            <button
              key={time}
              onClick={() => handleSlotClick(time, endTime)}
              className={`
                px-3 py-2 text-sm font-medium rounded-lg border transition-all text-center
                ${selected 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-white text-on-surface hover:border-primary/50 hover:bg-red-50 border-outline-variant'}
              `}
            >
              {time} – {endTime}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotSelector;
