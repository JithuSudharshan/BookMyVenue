import React, { createContext, useState, useContext } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingMode, setBookingMode] = useState('hourly');
  const [selectedDates, setSelectedDates] = useState([]);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [pricing, setPricing] = useState(null);

  const resetBookingState = () => {
    setSelectedDates([]);
    setFromTime('');
    setToTime('');
    setGuestCount(1);
    setPricing(null);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingMode,
        setBookingMode,
        selectedDates,
        setSelectedDates,
        fromTime,
        setFromTime,
        toTime,
        setToTime,
        guestCount,
        setGuestCount,
        pricing,
        setPricing,
        resetBookingState
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  return useContext(BookingContext);
};
