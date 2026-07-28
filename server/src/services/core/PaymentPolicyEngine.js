import { paymentPolicyConfig } from '../../config/paymentPolicyConfig.js';
import { getTodayString, daysBetween } from '../../utils/dateUtils.js';

/**
 * Determines the payment policy and split amounts for a given booking.
 * Pure business logic, no UI formatting.
 */
export const determinePaymentPolicy = (bookingMode, startDateStr, totalAmount) => {
  const config = bookingMode === 'hourly' 
    ? paymentPolicyConfig.hourlyBookings 
    : paymentPolicyConfig.dailyBookings;

  let policy = 'full_payment';
  let advancePercentage = 100;
  let balanceDueDate = null;

  if (bookingMode === 'daily') {
    const todayStr = getTodayString();
    const daysUntilEvent = daysBetween(todayStr, startDateStr);

    if (daysUntilEvent > config.fullPaymentThresholdDays) {
      policy = 'advance_payment';
      advancePercentage = config.advancePercentage;
      
      // Due date is X days before the event (same as the threshold)
      const [y, m, d] = startDateStr.split('-').map(Number);
      balanceDueDate = new Date(Date.UTC(y, m - 1, d - config.fullPaymentThresholdDays));
    }
  }

  const advanceAmount = Math.round((totalAmount * advancePercentage) / 100);
  const remainingAmount = totalAmount - advanceAmount;

  return {
    paymentPolicy: policy,
    advanceAmount,
    remainingAmount,
    balanceDueDate,
    policyMetadata: {
      version: paymentPolicyConfig.version,
      advancePercentage,
      fullPaymentThresholdDays: config.fullPaymentThresholdDays,
      gracePeriodHours: config.gracePeriodHours,
    }
  };
};

/**
 * Evaluates whether a booking has satisfied its current payment requirement
 * based on the current date and the booking's policy metadata.
 */
export const isPaymentRequirementSatisfied = (booking) => {
  if (booking.paymentStatus === 'completed') return true;
  
  if (booking.paymentStatus === 'advance_paid') {
    const eventDateStr = booking.bookingMode === 'hourly' ? booking.date : booking.startDate;
    if (!eventDateStr) return false;
    
    const eventDate = new Date(eventDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const daysUntilEvent = (eventDate - today) / (1000 * 60 * 60 * 24);
    const fullPaymentThresholdDays = booking.pricing?.policyMetadata?.fullPaymentThresholdDays || 7;
    
    // If we are within the threshold, full payment is required
    if (daysUntilEvent <= fullPaymentThresholdDays) {
      return false;
    }
    // Otherwise, advance payment is still sufficient
    return true;
  }
  
  return false;
};
