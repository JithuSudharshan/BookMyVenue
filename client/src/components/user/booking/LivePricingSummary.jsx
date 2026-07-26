import React, { useEffect } from 'react';
import { useBooking } from '../../../store/BookingContext';
import { calculateHourlyPrice, calculateDailyPrice } from '../../../utils/pricingUtils';

const LivePricingSummary = ({ venue }) => {
  const { 
    bookingMode, 
    selectedDates, 
    fromTime, 
    toTime, 
    guestCount,
    pricing,
    setPricing
  } = useBooking();

  useEffect(() => {
    if (!venue || selectedDates.length === 0) {
      setPricing(null);
      return;
    }

    try {
      if (bookingMode === 'hourly' && fromTime && toTime) {
        const estPricing = calculateHourlyPrice(venue, fromTime, toTime, guestCount);
        setPricing(estPricing);
      } else if (bookingMode === 'daily') {
        const startDate = selectedDates[0];
        const endDate = selectedDates[selectedDates.length - 1];
        const estPricing = calculateDailyPrice(venue, startDate, endDate, guestCount);
        setPricing(estPricing);
      } else {
        setPricing(null);
      }
    } catch (error) {
      console.error("Pricing calculation error:", error);
      setPricing(null);
    }
  }, [venue, bookingMode, selectedDates, fromTime, toTime, guestCount, setPricing]);

  if (!pricing) return null;

  return (
    <div className="py-4 border-t border-outline-variant space-y-3">
      <h4 className="text-sm font-semibold text-on-surface mb-2">Price Breakdown</h4>
      
      <div className="flex justify-between text-sm text-on-surface-variant">
        <span>₹{venue.price} x {bookingMode === 'hourly' ? `${pricing.durationHours} hours` : `${pricing.nights} days`}</span>
        <span>₹{pricing.baseAmount}</span>
      </div>
      
      <div className="flex justify-between text-sm text-on-surface-variant">
        <span>Taxes (18% GST)</span>
        <span>₹{pricing.taxAmount}</span>
      </div>
      
      <div className="flex justify-between font-bold text-on-surface pt-2 border-t border-dashed border-outline-variant mt-2">
        <span>Total Payable</span>
        <span>₹{pricing.totalAmount}</span>
      </div>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        You won't be charged yet.
      </p>
    </div>
  );
};

export default LivePricingSummary;
