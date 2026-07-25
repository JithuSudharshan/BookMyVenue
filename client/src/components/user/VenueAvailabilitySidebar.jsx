import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CompactCalendar from './slot/CompactCalendar';
import BookingSummary from './BookingSummary';
import { generateTimeOptions } from '../../utils/timeUtils';

const VenueAvailabilitySidebar = ({ venue, overrides = [], year, month, onMonthChange }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDates, setSelectedDates] = useState([]);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

  // When month changes, reset selections
  useEffect(() => {
    setSelectedDates([]);
    setFromTime('');
    setToTime('');
  }, [year, month]);

  const handleDateClick = (dateStr) => {
    if (venue.bookingModel === 'hourly') {
      // Hourly: only one date can be selected
      setSelectedDates([dateStr]);
      setFromTime('');
      setToTime('');
    } else {
      // Daily: Continuous range
      if (selectedDates.length === 0) {
        setSelectedDates([dateStr]);
      } else if (selectedDates.length === 1) {
        // Find range
        const d1 = new Date(selectedDates[0]);
        const d2 = new Date(dateStr);
        const start = d1 < d2 ? d1 : d2;
        const end = d1 < d2 ? d2 : d1;
        
        const range = [];
        let curr = new Date(start);
        let invalid = false;
        
        while (curr <= end) {
          // ensure padded ISO string format YYYY-MM-DD local
          const ds = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
          
          // Check if blocked
          const override = overrides.find(o => o.date === ds);
          if (override?.isFullDayBlocked) {
            invalid = true;
            break;
          }
          range.push(ds);
          curr.setDate(curr.getDate() + 1);
        }

        if (invalid) {
          toast.error("Selected range contains blocked dates. Please choose another range.");
          setSelectedDates([]);
        } else {
          setSelectedDates(range);
        }
      } else {
        // Reset and start new range
        setSelectedDates([dateStr]);
      }
    }
  };

  const timeOptions = generateTimeOptions(venue.bookingConfig?.openingTime, venue.bookingConfig?.closingTime);

  const handleBooking = () => {
    if (!user) {
      toast.info('Please log in to request a booking.');
      navigate('/login');
      return;
    }
    if (selectedDates.length === 0) {
      toast.error('Please select date(s).');
      return;
    }
    if (venue.bookingModel === 'hourly' && (!fromTime || !toTime)) {
      toast.error('Please select both from and to times.');
      return;
    }
    toast.success('Request Booking action triggered! (Deferred to next phase)');
  };

  return (
    <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-md">
      <h3 className="font-title-lg text-on-surface mb-1">Availability</h3>
      <p className="text-on-surface-variant font-body-sm mb-5">
        {venue.bookingModel === 'daily' 
          ? 'Select a date or continuous range.' 
          : 'Select a date and time slot.'}
      </p>

      <div className="mb-6">
        <CompactCalendar 
          year={year}
          month={month}
          overrides={overrides}
          bookingModel={venue.bookingModel}
          selectedDates={selectedDates}
          onDateClick={handleDateClick}
          onMonthChange={onMonthChange}
        />
      </div>

      {selectedDates.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {venue.bookingModel === 'daily' ? (
               selectedDates.map(d => (
                 <span key={d} className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-full border border-outline-variant">
                   {new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                 </span>
               ))
            ) : (
               <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-full border border-outline-variant">
                 {new Date(selectedDates[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
               </span>
            )}
          </div>

          {venue.bookingModel === 'hourly' && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">From Time</label>
                <select
                  value={fromTime}
                  onChange={(e) => {
                    setFromTime(e.target.value);
                    setToTime('');
                  }}
                  className="w-full p-2 border border-outline-variant rounded-lg text-sm bg-surface"
                >
                  <option value="">Select</option>
                  {timeOptions.slice(0, -1).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-on-surface-variant mb-1">To Time</label>
                <select
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  disabled={!fromTime}
                  className="w-full p-2 border border-outline-variant rounded-lg text-sm bg-surface disabled:opacity-50"
                >
                  <option value="">Select</option>
                  {timeOptions.filter(t => {
                    if (!fromTime) return true;
                    return parseInt(t.split(':')[0]) >= parseInt(fromTime.split(':')[0]) + 1;
                  }).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <BookingSummary 
          price={venue.price}
          selectedDates={selectedDates}
          fromTime={fromTime}
          toTime={toTime}
          bookingModel={venue.bookingModel}
        />
        
        <button
          onClick={handleBooking}
          className="w-full flex items-center justify-center py-3 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all shadow-sm"
        >
          Request Booking
        </button>
      </div>
    </div>
  );
};

export default VenueAvailabilitySidebar;
