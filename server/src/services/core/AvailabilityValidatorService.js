import Venue from '../../models/venueModel.js';
import AvailabilityOverride from '../../models/availabilityOverrideModel.js';
import AppError from '../../utils/AppError.js';
import { getEffectiveBookingMode } from '../../utils/venueUtils.js';
import { isPastDate, isTodayOrPastDate, getDayOfWeek, timeToMinutes, getTodayString, parseDateToInt } from '../../utils/dateUtils.js';

const checkTimeOverlap = (newFrom, newTo, existingBlocks) => {
  const nFrom = timeToMinutes(newFrom);
  const nTo = timeToMinutes(newTo);
  
  for (const block of existingBlocks) {
    const eFrom = timeToMinutes(block.fromTime);
    const eTo = timeToMinutes(block.toTime);
    
    // Strict overlap logic
    if (nFrom < eTo && nTo > eFrom) {
      return true; 
    }
  }
  return false;
};

export const validateHourlySlots = async (venueId, date, fromTime, toTime, guestCount) => {
  const venue = await Venue.findById(venueId);
  if (!venue || venue.venueStatus !== 'active' || venue.approval?.status !== 'approved') {
    throw new AppError('This venue is currently unavailable', 400);
  }
  
  const effectiveMode = getEffectiveBookingMode(venue);
  if (effectiveMode === 'daily') {
    throw new AppError('This venue only accepts daily bookings', 400);
  }
  
  if (guestCount !== undefined && guestCount > venue.capacity) {
    throw new AppError(`Guest count exceeds venue capacity of ${venue.capacity}`, 400);
  }
  
  if (isPastDate(date)) {
    throw new AppError('Cannot book past dates', 400);
  }

  // Advance booking limit
  if (venue.bookingConfig?.advanceBookingLimit) {
    const maxDays = venue.bookingConfig.maxAdvanceBookingDays || 90;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    maxDate.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    if (targetDate > maxDate) {
      throw new AppError(`Booking too far in advance. Max: ${maxDays} days`, 400);
    }
  }

  // Check operating hours
  const dayOfWeek = getDayOfWeek(date);
  const operatingHours = venue.bookingConfig?.operatingHours?.[dayOfWeek];
  if (!operatingHours || !operatingHours.isOpen) {
    throw new AppError('Venue is closed on this day', 400);
  }

  const nFrom = timeToMinutes(fromTime);
  const nTo = timeToMinutes(toTime);
  const opOpen = timeToMinutes(operatingHours.openTime);
  const opClose = timeToMinutes(operatingHours.closeTime);

  if (nFrom < opOpen || nTo > opClose) {
    throw new AppError('Selected time is outside operating hours', 400);
  }
  if (nFrom >= nTo) {
    throw new AppError('End time must be after start time', 400);
  }

  // Check overrides/blocks
  const override = await AvailabilityOverride.findOne({ venueId, date });
  if (override) {
    if (override.isFullDayBlocked) {
      throw new AppError('This date is fully booked or blocked', 400);
    }
    if (override.blocks && override.blocks.length > 0) {
      const hasOverlap = checkTimeOverlap(fromTime, toTime, override.blocks);
      if (hasOverlap) {
        throw new AppError('Selected time overlaps with an existing booking or block', 400);
      }
    }
  }

  return { isValid: true, venue };
};

export const validateDailyRange = async (venueId, startDate, endDate, guestCount) => {
  const venue = await Venue.findById(venueId);
  if (!venue || venue.venueStatus !== 'active' || venue.approval?.status !== 'approved') {
    throw new AppError('This venue is currently unavailable', 400);
  }
  
  const effectiveMode = getEffectiveBookingMode(venue);
  if (effectiveMode === 'hourly') {
    throw new AppError('This venue only accepts hourly bookings', 400);
  }

  if (guestCount !== undefined && guestCount > venue.capacity) {
    throw new AppError(`Guest count exceeds venue capacity of ${venue.capacity}`, 400);
  }

  if (isTodayOrPastDate(startDate)) {
    throw new AppError('Daily bookings must be reserved at least one day in advance', 400);
  }
  
  const start = parseDateToInt(startDate);
  const end = parseDateToInt(endDate);
  if (start > end) {
    throw new AppError('End date must be after start date', 400);
  }

  // Advance booking limit
  if (venue.bookingConfig?.advanceBookingLimit) {
    const maxDays = venue.bookingConfig.maxAdvanceBookingDays || 90;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    maxDate.setHours(0, 0, 0, 0);
    if (end > maxDate) {
      throw new AppError(`Booking too far in advance. Max: ${maxDays} days`, 400);
    }
  }

  // Check each day in the range
  const datesToCheck = [];
  const startDateObj = new Date(startDate); // Just for looping days safely
  const endDateObj = new Date(endDate);
  let curr = new Date(startDateObj);
  while (curr <= endDateObj) {
    datesToCheck.push(`${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`);
    curr.setDate(curr.getDate() + 1);
  }

  // Find overrides
  const overrides = await AvailabilityOverride.find({ venueId, date: { $in: datesToCheck } });
  const blockedDates = overrides.filter(o => o.isFullDayBlocked).map(o => o.date);
  
  if (blockedDates.length > 0) {
    throw new AppError(`The following dates are unavailable: ${blockedDates.join(', ')}`, 400);
  }

  // For daily, check if venue is closed on any of the days? 
  // Usually daily bookings ignore hourly operating hours, but if it's completely closed, we might reject.
  // We will assume daily means they just book the day.

  return { isValid: true, venue, nights: datesToCheck.length - 1 || 1 }; // Minimum 1 night/day
};
