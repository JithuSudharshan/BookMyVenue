import { paymentPolicyConfig } from '../../config/paymentPolicyConfig.js';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [y, m, d] = startDateStr.split('-');
    const startDate = new Date(Number(y), Number(m) - 1, Number(d));
    startDate.setHours(0, 0, 0, 0);

    const diffTime = startDate.getTime() - today.getTime();
    const daysUntilEvent = Math.ceil(diffTime / (1000 * 3600 * 24));

    if (daysUntilEvent > config.fullPaymentThresholdDays) {
      policy = 'advance_payment';
      advancePercentage = config.advancePercentage;
      
      // Due date is X days before the event (same as the threshold)
      balanceDueDate = new Date(startDate);
      balanceDueDate.setDate(balanceDueDate.getDate() - config.fullPaymentThresholdDays);
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
