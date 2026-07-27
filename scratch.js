import { generateHourlyStartTimes } from './server/src/services/core/AvailabilityEngine.js';

const bookingConfig = {
  bookingMode: 'hourly',
  operatingHours: {
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '21:00' }
  },
  bookingInterval: 60,
  preparationTime: 0
};

const override = {
  date: '2026-07-28',
  isFullDayBlocked: false,
  blocks: [
    { fromTime: '09:00', toTime: '10:00' },
    { fromTime: '10:00', toTime: '11:00' },
    { fromTime: '11:00', toTime: '12:00' },
    { fromTime: '12:00', toTime: '13:00' }, // 12 PM - 1 PM Blocked
    // 13:00 - 14:00 is Open!
    { fromTime: '14:00', toTime: '15:00' },
    { fromTime: '15:00', toTime: '16:00' },
    { fromTime: '16:00', toTime: '17:00' },
    { fromTime: '17:00', toTime: '18:00' },
    { fromTime: '18:00', toTime: '19:00' },
    { fromTime: '19:00', toTime: '20:00' },
    { fromTime: '20:00', toTime: '21:00' }
  ]
};

const times = generateHourlyStartTimes(bookingConfig, override, '2026-07-28');
console.log("AVAILABLE TIMES:", times);
