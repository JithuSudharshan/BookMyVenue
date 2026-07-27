import { timeToMinutes, daysBetween } from '../../utils/dateUtils.js';

export const calculateHourlyPrice = (venue, fromTime, toTime, guestCount) => {
  const startMins = timeToMinutes(fromTime);
  const endMins = timeToMinutes(toTime);
  const durationHours = (endMins - startMins) / 60;

  if (durationHours <= 0) {
    throw new Error('Invalid duration');
  }

  const baseAmount = venue.price * durationHours;
  const totalAmount = baseAmount; // No tax for MVP

  return {
    baseAmount: Math.round(baseAmount),
    totalAmount: Math.round(totalAmount),
    durationHours
  };
};

export const calculateDailyPrice = (venue, startDate, endDate, guestCount) => {
  // Calculate total days (inclusive of both start and end dates)
  let days = daysBetween(startDate, endDate) + 1;
  if (days <= 0) days = 1;

  const baseAmount = venue.price * days;
  const totalAmount = baseAmount; // No tax for MVP

  return {
    baseAmount: Math.round(baseAmount),
    totalAmount: Math.round(totalAmount),
    nights: days
  };
};

export const calculateWalletDeduction = (totalPayable, walletBalance) => {
  if (walletBalance <= 0) {
    return {
      walletDeduction: 0,
      remainingPayable: totalPayable,
      paymentMethod: 'razorpay'
    };
  }

  if (walletBalance >= totalPayable) {
    return {
      walletDeduction: totalPayable,
      remainingPayable: 0,
      paymentMethod: 'wallet'
    };
  }

  return {
    walletDeduction: walletBalance,
    remainingPayable: totalPayable - walletBalance,
    paymentMethod: 'hybrid'
  };
};
