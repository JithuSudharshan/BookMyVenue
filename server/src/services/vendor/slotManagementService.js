import * as slotOverrideRepository from '../../repositories/vendor/slotOverrideRepository.js';
import { findVenueByVendor } from '../../repositories/vendor/venueRepository.js';
import AppError from '../../utils/appError.js';
import Venue from '../../models/venueModel.js';

const isPastDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate < today;
};

export const getMonthOverview = async (vendorId, venueId, year, month) => {
  const venue = await findVenueByVendor(venueId, vendorId);
  if (!venue) throw new AppError('Venue not found or unauthorized', 403);
  return await slotOverrideRepository.findOverridesByVenueAndMonth(venueId, year, month);
};

export const blockDailySlots = async (vendorId, venueId, dates, reason) => {
  const venue = await findVenueByVendor(venueId, vendorId);
  if (!venue) throw new AppError('Venue not found or unauthorized', 403);
  if (venue.approval?.status !== 'approved') throw new AppError('Venue must be approved to manage slots', 400);
  
  if (!Array.isArray(dates) || dates.length === 0) throw new AppError('Dates array is required', 400);
  if (dates.some(isPastDate)) throw new AppError('Cannot block past dates', 400);
  if (reason === 'Customer Booking') throw new AppError("Vendors cannot manually block with reason 'Customer Booking'", 400);

  const existingSlots = await slotOverrideRepository.findOverridesByVenueAndDates(venueId, dates);
  for (const slot of existingSlots) {
    if (slot.fullDayReason === 'Customer Booking') {
      throw new AppError(`Date ${slot.date} already has a full-day customer booking and cannot be blocked`, 400);
    }
    if (slot.blockedSlots && slot.blockedSlots.some(s => s.reason === 'Customer Booking')) {
      throw new AppError(`Date ${slot.date} already has hourly customer bookings and cannot be fully blocked`, 400);
    }
  }

  return await slotOverrideRepository.upsertManyFullDayOverrides(venueId, dates, { 
    isFullDayBlocked: true, 
    fullDayReason: reason 
  });
};

const checkTimeOverlap = (newFrom, newTo, existingBlocks) => {
  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  const nFrom = parseTime(newFrom);
  const nTo = parseTime(newTo);
  
  for (const block of existingBlocks) {
    const eFrom = parseTime(block.fromTime);
    const eTo = parseTime(block.toTime);
    
    // Check overlap with 1 hour (60 mins) buffer
    if (!(nFrom >= eTo + 60 || nTo <= eFrom - 60)) {
      return true; 
    }
  }
  return false;
};

export const blockHourlySlot = async (vendorId, venueId, date, fromTime, toTime, reason) => {
  const venue = await findVenueByVendor(venueId, vendorId);
  if (!venue) throw new AppError('Venue not found or unauthorized', 403);
  if (venue.approval?.status !== 'approved') throw new AppError('Venue must be approved to manage slots', 400);
  
  if (isPastDate(date)) throw new AppError('Cannot block past dates', 400);
  if (reason === 'Customer Booking') throw new AppError("Vendors cannot manually block with reason 'Customer Booking'", 400);
  if (fromTime >= toTime) throw new AppError('fromTime must be before toTime', 400);

  const existingOverride = await slotOverrideRepository.findOverrideByVenueAndDate(venueId, date);
  if (existingOverride) {
    if (existingOverride.fullDayReason === 'Customer Booking') {
      throw new AppError('Date already has a full-day customer booking and cannot be blocked', 400);
    }
    if (existingOverride.blockedSlots && existingOverride.blockedSlots.length > 0) {
      const hasOverlap = checkTimeOverlap(fromTime, toTime, existingOverride.blockedSlots);
      if (hasOverlap) throw new AppError('Selected time overlaps with existing blocks or requires a 1-hour buffer', 400);
    }
  }

  return await slotOverrideRepository.pushHourlySlot(venueId, date, { fromTime, toTime, reason, bookingId: null });
};

export const removeOverride = async (vendorId, venueId, date, bookingId = null, slotIndex = null) => {
  const venue = await findVenueByVendor(venueId, vendorId);
  if (!venue) throw new AppError('Venue not found or unauthorized', 403);

  const existingOverride = await slotOverrideRepository.findOverrideByVenueAndDate(venueId, date);
  if (!existingOverride) throw new AppError('Override not found', 404);

  if (bookingId) {
    const slot = existingOverride.blockedSlots.find(s => s.bookingId && s.bookingId.toString() === bookingId.toString());
    if (slot && slot.reason === 'Customer Booking') throw new AppError('Vendors cannot remove customer bookings', 400);
    await slotOverrideRepository.pullHourlySlotByBookingId(venueId, date, bookingId);
  } else if (slotIndex !== null && slotIndex !== undefined) {
    const slot = existingOverride.blockedSlots[slotIndex];
    if (slot && slot.reason === 'Customer Booking') throw new AppError('Vendors cannot remove customer bookings', 400);
    if (slot) {
      // Need to use pullHourlySlotByTime since we can't easily pull by index in Mongo natively without knowing the object
      await slotOverrideRepository.pullHourlySlotByTime(venueId, date, slot.fromTime, slot.toTime);
    }
  } else {
    // Full day removal
    if (existingOverride.fullDayReason === 'Customer Booking') throw new AppError('Vendors cannot remove customer bookings', 400);
    await slotOverrideRepository.deleteOverride(venueId, date);
  }
  return { success: true };
};

export const acknowledgeSlots = async (vendorId, venueId) => {
  const venue = await findVenueByVendor(venueId, vendorId);
  if (!venue) throw new AppError('Venue not found or unauthorized', 403);
  if (venue.approval?.status !== 'approved') throw new AppError('Venue must be approved to manage slots', 400);

  return await Venue.findByIdAndUpdate(venueId, { hasAcknowledgedSlots: true }, { new: true });
};
