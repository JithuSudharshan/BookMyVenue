import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../../store/BookingContext';
import { getPublicAvailability } from '../../../api/user-api/userApi';
import { toast } from 'sonner';
import CompactCalendar from '../slot/CompactCalendar';
import SlotSelector from './SlotSelector';
import GuestCountStepper from './GuestCountStepper';
import LivePricingSummary from './LivePricingSummary';
import axiosInstance from '../../../api/axiosConfig'; // Fixed filename

const BookingWidget = ({ venue, overrides = [], year, month, onMonthChange }) => {
  const navigate = useNavigate();
  const { 
    bookingMode, 
    setBookingMode,
    selectedDates, 
    setSelectedDates,
    fromTime,
    toTime,
    guestCount,
    resetBookingState 
  } = useBooking();

  const [availableStartTimes, setAvailableStartTimes] = useState([]);
  const [hourlyConfig, setHourlyConfig] = useState(null);
  const [loadingHours, setLoadingHours] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize booking mode from venue config
  useEffect(() => {
    // Prefer top-level bookingModel (legacy) over nested config to prevent default overrides
    const mode = venue?.bookingModel || venue?.bookingConfig?.bookingMode;
    if (mode) {
      if (mode === 'both') {
        setBookingMode('hourly'); // Default to hourly if both supported
      } else {
        setBookingMode(mode);
      }
    }
  }, [venue, setBookingMode]);

  // Fetch hourly availability when date is selected
  useEffect(() => {
    const fetchHourlyAvailability = async () => {
      if (bookingMode === 'hourly' && selectedDates.length === 1) {
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
  }, [selectedDates, venue._id, bookingMode]);

  const handleDateClick = (dateStr) => {
    if (bookingMode === 'hourly') {
      setSelectedDates([dateStr]);
    } else {
      // Daily: Continuous range
      if (selectedDates.length === 0) {
        setSelectedDates([dateStr]);
      } else if (selectedDates.length === 1) {
        const d1 = new Date(selectedDates[0]);
        const d2 = new Date(dateStr);
        const start = d1 < d2 ? d1 : d2;
        const end = d1 < d2 ? d2 : d1;
        
        const range = [];
        let curr = new Date(start);
        let invalid = false;
        
        while (curr <= end) {
          const ds = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
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
        setSelectedDates([dateStr]);
      }
    }
  };

  const handleReserve = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select date(s).');
      return;
    }
    if (bookingMode === 'hourly' && (!fromTime || !toTime)) {
      toast.error('Please select a time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        venueId: venue._id,
        bookingMode,
        guestCount,
      };

      if (bookingMode === 'hourly') {
        payload.date = selectedDates[0];
        payload.fromTime = fromTime;
        payload.toTime = toTime;
      } else {
        payload.startDate = selectedDates[0];
        payload.endDate = selectedDates[selectedDates.length - 1];
      }

      const response = await axiosInstance.post('/bookings/session', payload);
      const { sessionId } = response.data.data;
      
      toast.success('Reservation held!');
      navigate(`/booking/pay/${sessionId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-3xl p-6 border border-outline-variant shadow-md sticky top-6">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="text-2xl font-bold text-gray-900">
          ₹{venue.price} <span className="text-sm font-normal text-gray-500">/ {bookingMode === 'hourly' ? 'hour' : 'day'}</span>
        </h3>
      </div>

      <div className="mb-6">
        <CompactCalendar 
          year={year}
          month={month}
          overrides={overrides}
          bookingModel={bookingMode}
          selectedDates={selectedDates}
          onDateClick={handleDateClick}
          onMonthChange={onMonthChange}
        />
      </div>

      {bookingMode === 'hourly' && selectedDates.length === 1 && (
        <SlotSelector 
          availableStartTimes={availableStartTimes} 
          hourlyConfig={hourlyConfig} 
        />
      )}

      {selectedDates.length > 0 && (
        <GuestCountStepper maxCapacity={venue.capacity} />
      )}

      <LivePricingSummary venue={venue} />

      <button
        onClick={handleReserve}
        disabled={isSubmitting || selectedDates.length === 0 || (bookingMode === 'hourly' && (!fromTime || !toTime))}
        className="w-full flex items-center justify-center py-3.5 mt-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          'Reserve Now'
        )}
      </button>
    </div>
  );
};

export default BookingWidget;
