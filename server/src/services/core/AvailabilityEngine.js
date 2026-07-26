/**
 * AvailabilityEngine.js
 * Core domain service for generating and validating venue availability.
 * Follows purely functional design where possible, using venue config and overrides as inputs.
 */

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Helper to parse HH:mm into minutes from midnight
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper to format minutes from midnight to HH:mm
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Validates basic daily availability (e.g. is the venue open at all today?)
 */
export const checkDailyAvailability = (bookingConfig, override, requestDate) => {

  const [y, m, d] = requestDate.split('-');
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  
  const dailyHours = bookingConfig.operatingHours?.[dayName] || { isOpen: true, openTime: '00:00', closeTime: '23:59' };
  if (!dailyHours || !dailyHours.isOpen) {
    return false; // Closed on this day
  }

  if (override && override.isFullDayBlocked) {
    return false;
  }

  return true;
};

/**
 * Generates an array of available start times for a given date
 */
export const generateHourlyStartTimes = (bookingConfig, override, requestDate) => {

  const [y, m, d] = requestDate.split('-');
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  
  const dailyHours = bookingConfig.operatingHours?.[dayName] || { isOpen: true, openTime: '00:00', closeTime: '23:59' };
  if (!dailyHours || !dailyHours.isOpen) {
    return []; // Closed on this day
  }

  if (override && override.isFullDayBlocked) {
    return [];
  }

  const openMin = timeToMinutes(dailyHours.openTime);
  const closeMin = timeToMinutes(dailyHours.closeTime);
  const interval = bookingConfig.bookingInterval || 60;
  const minDuration = interval; // Minimum duration is exactly the booking interval
  const prepTime = bookingConfig.preparationTime || 0;

  // Process blocks: convert to minutes and add prep time
  const occupiedRanges = [];
  if (override && override.blocks) {
    override.blocks.forEach(block => {
      const fromMin = timeToMinutes(block.fromTime);
      const toMin = timeToMinutes(block.toTime) + prepTime; // Buffer applied after booking
      occupiedRanges.push({ start: fromMin, end: toMin });
    });
  }
  occupiedRanges.sort((a, b) => a.start - b.start);

  const availableStartTimes = [];
  
  for (let current = openMin; current + minDuration <= closeMin; current += interval) {
    const requiredEnd = current + minDuration;
    
    let collision = false;
    for (const range of occupiedRanges) {
      if (current < range.end && requiredEnd > range.start) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      availableStartTimes.push(minutesToTime(current));
    }
  }

  return availableStartTimes;
};

/**
 * Returns available end times for a specific start time
 */
export const generateValidEndTimes = (bookingConfig, override, requestDate, startTimeStr) => {
  const startMin = timeToMinutes(startTimeStr);
  const dateObj = new Date(requestDate);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  
  const dailyHours = bookingConfig.operatingHours?.[dayName] || { isOpen: true, openTime: '00:00', closeTime: '23:59' };
  if (!dailyHours || !dailyHours.isOpen) return [];

  const closeMin = timeToMinutes(dailyHours.closeTime);
  const interval = bookingConfig.bookingInterval || 60;
  const minDuration = interval; // Minimum duration is exactly the booking interval
  
  // Find the next block that occurs after the start time
  let nextBlockStart = closeMin;
  
  if (override && override.blocks) {
    for (const block of override.blocks) {
      const blockStartMin = timeToMinutes(block.fromTime);
      // We don't apply prep time here because the prep time belongs to the existing block,
      // and we are trying to fit AHEAD of it. If we overlap its prep time, we can't end then.
      // Wait, actually, if a block starts at 11:00, we can end at 11:00. The prep time is AFTER the block.
      // What if there is prep time after OUR booking?
      // If we end at 11:00, we need prepTime of our own before the next block!
      const ourPrepTime = bookingConfig.preparationTime || 0;
      
      // So if next block starts at blockStartMin, we must end by blockStartMin - ourPrepTime
      if (blockStartMin > startMin) {
        const effectiveLimit = blockStartMin - ourPrepTime;
        if (effectiveLimit < nextBlockStart) {
          nextBlockStart = effectiveLimit;
        }
      }
    }
  }

  const validEndTimes = [];
  let currentEnd = startMin + minDuration;

  while (currentEnd <= nextBlockStart) {
    validEndTimes.push(minutesToTime(currentEnd));
    currentEnd += interval;
  }

  return validEndTimes;
};
