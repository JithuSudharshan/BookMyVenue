export const paymentPolicyConfig = {
  version: '1.0',
  dailyBookings: {
    advancePercentage: 30,
    fullPaymentThresholdDays: 7,
    gracePeriodHours: 24,
  },
  hourlyBookings: {
    advancePercentage: 100, // Hourly always requires full payment for MVP
    fullPaymentThresholdDays: 0, 
    gracePeriodHours: 24,
  }
};
