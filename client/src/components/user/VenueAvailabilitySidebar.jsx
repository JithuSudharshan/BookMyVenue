import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CompactCalendar from './slot/CompactCalendar';
import { getPublicAvailability } from '../../api/user-api/userApi';
import BookingSummary from './BookingSummary';
import TimeSlotPill from '../common/Slot/TimeSlotPill';

const VenueAvailabilitySidebar = ({ venue, overrides = [], year, month, onMonthChange }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDates, setSelectedDates] = useState([]);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [availableStartTimes, setAvailableStartTimes] = useState([]);
  const [availableEndTimes, setAvailableEndTimes] = useState([]);
  const [hourlyConfig, setHourlyConfig] = useState(null);
  const [loadingHours, setLoadingHours] = useState(false);

  // When month changes, reset selections
  useEffect(() => {
    setSelectedDates([]);
    setFromTime('');
    setToTime('');
    setAvailableStartTimes([]);
    setAvailableEndTimes([]);
  }, [year, month]);

  // Fetch hourly availability when date is selected
  useEffect(() => {
    const fetchHourlyAvailability = async () => {
      if (venue.bookingModel === 'hourly' && selectedDates.length === 1) {
        setLoadingHours(true);
        try {
          const data = await getPublicAvailability(venue._id, { date: selectedDates[0] });
          if (data && data.mode === 'hourly') {
            setAvailableStartTimes(data.availableStartTimes || []);
            setHourlyConfig(data);
          }
        } catch (error) {
          toast.error('Failed to load available times for this date.');
        } finally {
          setLoadingHours(false);
        }
      }
    };
    fetchHourlyAvailability();
  }, [selectedDates, venue._id, venue.bookingModel]);

  // Since booking logic is deferred for this phase, we don't need to compute multi-hour selections or end times
  // We simply display the available time ranges.
  useEffect(() => {
    // Reset selections on date change
    setFromTime('');
    setToTime('');
    setAvailableEndTimes([]);
  }, [fromTime, hourlyConfig]);

  const handleDateClick = (dateStr) => {
    if (venue.bookingModel === 'hourly') {
      setSelectedDates([dateStr]);
      setFromTime('');
      setToTime('');
      setAvailableEndTimes([]);
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

  const handleFromTimeSelect = (time) => {
    setFromTime(time);
  };

  const handleToTimeSelect = (time) => {
    setToTime(time);
  };

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
      <h3 className="text-2xl font-bold text-gray-900 mb-1">Availability</h3>
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
            <div className="mt-6 border-t border-outline-variant pt-5">
              <h4 className="text-sm font-semibold text-on-surface mb-4">
                Available Times for {new Date(selectedDates[0]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </h4>
              
              {loadingHours ? (
                <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : availableStartTimes.length === 0 ? (
                <div className="text-sm text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg">No available times for this date.</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Available Time Ranges</label>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {availableStartTimes.map(time => {
                        const [h, m] = time.split(':').map(Number);
                        const interval = hourlyConfig?.interval || 60;
                        const nextMin = h * 60 + m + interval;
                        const endH = Math.floor(nextMin / 60).toString().padStart(2, '0');
                        const endM = (nextMin % 60).toString().padStart(2, '0');
                        const endTime = `${endH}:${endM}`;
                        
                        return (
                          <TimeSlotPill
                            key={time}
                            startTime={time}
                            endTime={endTime}
                            status="available"
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {venue.bookingModel === 'hourly' && selectedDates.length === 0 && (
        <div className="mb-6 bg-surface-variant/30 rounded-xl p-5 border border-outline-variant text-center flex flex-col items-center">
           <svg className="w-8 h-8 text-on-surface-variant mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <p className="text-sm text-on-surface-variant font-medium">Pick a date to see available time slots</p>
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
