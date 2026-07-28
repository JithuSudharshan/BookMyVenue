/**
 * AvailabilityEngine.js
 * Core domain service for generating and validating venue availability.
 * Follows purely functional design where possible, using venue config and overrides as inputs.
 */

import { getDayOfWeek, timeToMinutes, minutesToTime, getTodayString, getNowMinutes } from '../../utils/dateUtils.js';
import { DEFAULT_BOOKING_INTERVAL } from '../../utils/venueConstants.js';

/**
 * Validates basic daily availability (e.g. is the venue open at all today?)
 */
export const checkDailyAvailability = (bookingConfig, override, requestDate) => {

  const dayName = getDayOfWeek(requestDate);
  
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

  const dayName = getDayOfWeek(requestDate);
  
  const dailyHours = bookingConfig.operatingHours?.[dayName] || { isOpen: true, openTime: '00:00', closeTime: '23:59' };
  if (!dailyHours || !dailyHours.isOpen) {
    return []; // Closed on this day
  }

  if (override && override.isFullDayBlocked) {
    return [];
  }

  const openMin = timeToMinutes(dailyHours.openTime);
  const closeMin = timeToMinutes(dailyHours.closeTime);
  const interval = bookingConfig.bookingInterval || DEFAULT_BOOKING_INTERVAL;
  const minDuration = interval; // Minimum duration is exactly the booking interval

  // Process blocks: convert to minutes
  const occupiedRanges = [];
  if (override && override.blocks) {
    override.blocks.forEach(block => {
      const fromMin = timeToMinutes(block.fromTime);
      const toMin = timeToMinutes(block.toTime);
      occupiedRanges.push({ start: fromMin, end: toMin });
    });
  }
  occupiedRanges.sort((a, b) => a.start - b.start);

  let effectiveOpenMin = openMin;
  
  // Real-time cutoff for today's date
  const todayStr = getTodayString();
  
  if (requestDate === todayStr) {
    const TODAY_BUFFER_MINUTES = 30; // Cannot book a slot starting in < 30 minutes
    const currentMin = getNowMinutes();
    const cutoff = currentMin + TODAY_BUFFER_MINUTES;
    
    // Snap to the next available interval
    const nextSlotMin = Math.ceil(cutoff / interval) * interval;
    
    effectiveOpenMin = Math.max(openMin, nextSlotMin);
  }

  const availableStartTimes = [];
  
  for (let current = effectiveOpenMin; current + minDuration <= closeMin; current += interval) {
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
  const dayName = getDayOfWeek(requestDate);
  
  const dailyHours = bookingConfig.operatingHours?.[dayName] || { isOpen: true, openTime: '00:00', closeTime: '23:59' };
  if (!dailyHours || !dailyHours.isOpen) return [];

  const closeMin = timeToMinutes(dailyHours.closeTime);
  const interval = bookingConfig.bookingInterval || DEFAULT_BOOKING_INTERVAL;
  const minDuration = interval; // Minimum duration is exactly the booking interval
  
  // Find the next block that occurs after the start time
  let nextBlockStart = closeMin;
  
  if (override && override.blocks) {
    for (const block of override.blocks) {
      const blockStartMin = timeToMinutes(block.fromTime);
      if (blockStartMin > startMin) {
        if (blockStartMin < nextBlockStart) {
          nextBlockStart = blockStartMin;
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
