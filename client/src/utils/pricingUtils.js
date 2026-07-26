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

  const baseAmount = venue.price * durationHours;
  const taxRate = 0.18; // 18% GST
  const taxAmount = baseAmount * taxRate;
  const totalAmount = baseAmount + taxAmount;
  const advanceAmount = totalAmount;

  return {
    baseAmount: Math.round(baseAmount),
    taxAmount: Math.round(taxAmount),
    totalAmount: Math.round(totalAmount),
    advanceAmount: Math.round(advanceAmount),
    remainingAmount: Math.round(totalAmount - advanceAmount),
    durationHours
  };
};

export const calculateDailyPrice = (venue, startDate, endDate, guestCount) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const timeDiff = end.getTime() - start.getTime();
  let days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  if (days <= 0) days = 1;

  const baseAmount = venue.price * days;
  const taxRate = 0.18;
  const taxAmount = baseAmount * taxRate;
  const totalAmount = baseAmount + taxAmount;
  const advanceAmount = totalAmount;

  return {
    baseAmount: Math.round(baseAmount),
    taxAmount: Math.round(taxAmount),
    totalAmount: Math.round(totalAmount),
    advanceAmount: Math.round(advanceAmount),
    remainingAmount: Math.round(totalAmount - advanceAmount),
    nights: days
  };
};
