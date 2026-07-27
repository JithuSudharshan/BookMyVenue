import React, { useEffect, useState } from 'react';
import { useBooking } from '../../../store/BookingContext';
import axiosInstance from '../../../api/axiosConfig';

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!venue || selectedDates.length === 0) {
      setPricing(null);
      setError(null);
      return;
    }

    if (bookingMode === 'hourly' && (!fromTime || !toTime)) {
      setPricing(null);
      setError(null);
      return;
    }

    const fetchPricing = async () => {
      setLoading(true);
      setError(null);
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

        const response = await axiosInstance.post('/bookings/pricing-summary', payload);
        if (response.data?.success || response.data?.status === 'success') {
          setPricing(response.data.data);
        }
      } catch (err) {
        console.error("Pricing fetch error:", err);
        setError(err.response?.data?.message || 'Failed to calculate pricing or slots unavailable.');
        setPricing(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call by 300ms
    const timer = setTimeout(() => {
      fetchPricing();
    }, 300);

    return () => clearTimeout(timer);
  }, [venue, bookingMode, selectedDates, fromTime, toTime, guestCount, setPricing]);

  if (error) {
    return (
      <div className="py-4 border-t border-outline-variant space-y-3">
        <p className="text-sm text-red-500 font-medium text-center">{error}</p>
      </div>
    );
  }

  if (loading && !pricing) {
    return (
      <div className="py-4 border-t border-outline-variant flex justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pricing) return null;

  return (
    <div className="py-4 border-t border-outline-variant space-y-3 relative">
      {loading && (
        <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-lg">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <h4 className="text-sm font-semibold text-on-surface mb-2">Price Breakdown</h4>
      
      <div className="flex justify-between text-sm text-on-surface-variant">
        <span>Venue Charges ({bookingMode === 'hourly' ? `${pricing.durationHours} hours` : `${pricing.nights} days`})</span>
        <span>₹{pricing.totalAmount?.toLocaleString('en-IN')}</span>
      </div>
      
      <div className="flex justify-between font-bold text-on-surface pt-2 border-t border-dashed border-outline-variant mt-2">
        <span>Total Amount</span>
        <span>₹{pricing.totalAmount?.toLocaleString('en-IN')}</span>
      </div>

      {/* Payment Policy UI from Backend */}
      <div className="mt-4 p-3 bg-surface-variant/30 border border-outline-variant rounded-xl">
        {pricing.paymentPolicy === 'full_payment' && pricing.ui?.userMessage === 'Full Payment Required' ? (
          <div className="space-y-1">
            <div className="flex items-start gap-2 text-red-600">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span className="font-semibold text-sm">{pricing.ui?.userMessage}</span>
            </div>
            <p className="text-xs text-on-surface-variant pl-6">{pricing.ui?.userMessageSub}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-primary">{pricing.ui?.userMessage}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span>{pricing.ui?.userMessageSub}</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        {pricing.ui?.paymentTimeline && pricing.ui.paymentTimeline.length > 0 && (
          <div className="mt-3 pt-3 border-t border-outline-variant/50">
            <div className="flex items-center text-xs">
              {pricing.ui.paymentTimeline.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <span className={`font-semibold ${item.status === 'current' ? 'text-primary' : 'text-on-surface-variant'}`}>{item.step}</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">{item.text}</span>
                  </div>
                  {index < pricing.ui.paymentTimeline.length - 1 && (
                    <div className="flex-1 border-t border-dashed border-gray-300 mx-2 mt-[-12px]"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        You won't be charged yet.
      </p>
    </div>
  );
};

export default LivePricingSummary;
