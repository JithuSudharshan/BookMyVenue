import React from 'react';

const BookingSummary = ({ price = 0, selectedDates = [], fromTime, toTime, bookingModel }) => {
  if (bookingModel === 'daily' && selectedDates.length > 0) {
    const total = price * selectedDates.length;
    return (
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-3">
        <div className="flex justify-between text-on-surface font-body-md">
          <span>₹{price.toLocaleString('en-IN')} × {selectedDates.length} day{selectedDates.length > 1 ? 's' : ''}</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
        <hr className="border-outline-variant" />
        <div className="flex justify-between text-on-surface font-title-md">
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    );
  }

  if (bookingModel === 'hourly' && selectedDates.length > 0 && fromTime && toTime) {
    const fromHour = parseInt(fromTime.split(':')[0]);
    const toHour = parseInt(toTime.split(':')[0]);
    const hours = toHour - fromHour;
    
    if (hours > 0) {
      const total = price * hours;
      return (
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant space-y-3">
          <div className="flex justify-between text-on-surface font-body-md">
            <span>₹{price.toLocaleString('en-IN')} × {hours} hour{hours > 1 ? 's' : ''}</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <hr className="border-outline-variant" />
          <div className="flex justify-between text-on-surface font-title-md">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      );
    }
  }

  return null;
};

export default BookingSummary;
