import React, { useState } from 'react';
import { useBooking } from '../../../store/BookingContext';
import { Minus, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

const GuestCountStepper = ({ maxCapacity }) => {
  const { guestCount, setGuestCount } = useBooking();
  const [error, setError] = useState('');

  const handleDecrement = () => {
    if (guestCount > 1) {
      setGuestCount(guestCount - 1);
      setError('');
    }
  };

  const handleIncrement = () => {
    if (guestCount < maxCapacity) {
      setGuestCount(guestCount + 1);
      setError('');
    } else {
      toast.warning(`Maximum capacity is ${maxCapacity} guests`);
    }
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      setGuestCount('');
      setError('');
      return;
    }
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      setGuestCount(val);
      if (val > maxCapacity) {
        setError(`Exceeds maximum capacity of ${maxCapacity} guests.`);
      } else if (val < 1) {
        setError('At least 1 guest is required.');
      } else {
        setError('');
      }
    }
  };

  const handleBlur = () => {
    let val = parseInt(guestCount, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > maxCapacity) {
      val = maxCapacity;
    }
    setGuestCount(val);
    setError('');
  };

  return (
    <div className="py-4 border-t border-outline-variant flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-on-surface-variant" />
          <div>
            <h4 className="text-sm font-semibold text-on-surface">Guests</h4>
            <p className="text-xs text-on-surface-variant">Max {maxCapacity}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={guestCount <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant disabled:opacity-40 hover:bg-surface-variant transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Direct-type input */}
          <input
            type="number"
            min={1}
            max={maxCapacity}
            value={guestCount}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-16 text-center text-sm font-semibold border rounded-lg py-1 focus:outline-none focus:ring-2 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              ${error
                ? 'border-red-400 text-red-600 focus:ring-red-300 bg-red-50'
                : 'border-outline-variant text-on-surface focus:ring-primary/40 focus:border-primary'
              }`
            }
          />

          <button
            onClick={handleIncrement}
            disabled={guestCount >= maxCapacity}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant disabled:opacity-40 hover:bg-surface-variant transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default GuestCountStepper;
