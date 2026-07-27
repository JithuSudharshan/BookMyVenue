export const calculateHourlyPrice = (venue, fromTime, toTime, guestCount) => {
  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const startMins = parseTime(fromTime);
  const endMins = parseTime(toTime);
  const durationHours = (endMins - startMins) / 60;

  if (durationHours <= 0) {
    throw new Error('Invalid duration');
  }

  // Basic capacity check
  if (guestCount > venue.capacity) {
    throw new Error(`Guest count exceeds venue capacity of ${venue.capacity}`);
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
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate total days (inclusive of both start and end dates)
  const timeDiff = end.getTime() - start.getTime();
  let days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  if (days <= 0) days = 1;

  if (guestCount > venue.capacity) {
    throw new Error(`Guest count exceeds venue capacity of ${venue.capacity}`);
  }

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
