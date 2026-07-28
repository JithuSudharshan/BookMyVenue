import * as slotOverrideRepository from '../../repositories/vendor/slotOverrideRepository.js';
import { findVenueByVendor } from '../../repositories/vendor/venueRepository.js';
import AppError from '../../utils/AppError.js';
import Venue from '../../models/venueModel.js';
import BookingSession from '../../models/bookingSessionModel.js';
import { isPastDate, timeToMinutes } from '../../utils/dateUtils.js';

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
    if (slot.blocks && slot.blocks.some(s => s.reason === 'Customer Booking')) {
      throw new AppError(`Date ${slot.date} already has hourly customer bookings and cannot be fully blocked`, 400);
    }
  }

  return await slotOverrideRepository.upsertManyFullDayOverrides(venueId, dates, { 
    isFullDayBlocked: true, 
    fullDayReason: reason 
  });
};

const checkTimeOverlap = (newFrom, newTo, existingBlocks) => {
  const nFrom = timeToMinutes(newFrom);
  const nTo = timeToMinutes(newTo);
  
  for (const block of existingBlocks) {
    const eFrom = timeToMinutes(block.fromTime);
    const eTo = timeToMinutes(block.toTime);
    
    // Check for strict time overlap
    if (nFrom < eTo && nTo > eFrom) {
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
    if (existingOverride.blocks && existingOverride.blocks.length > 0) {
      const hasOverlap = checkTimeOverlap(fromTime, toTime, existingOverride.blocks);
      if (hasOverlap) throw new AppError('Selected time overlaps with existing blocks', 400);
    }
  }

  // Active session check
  const activeSession = await BookingSession.findOne({
    venueId,
    date,
    bookingMode: 'hourly',
    status: 'active',
    fromTime: { $lt: toTime },
    toTime:   { $gt: fromTime },
  });
  if (activeSession) {
    throw new AppError('This slot is currently held in an active customer session. It will be released within 10 minutes if not paid.', 409);
  }

  return await slotOverrideRepository.pushHourlySlot(venueId, date, { fromTime, toTime, reason, bookingId: null });
};

export const removeOverride = async (vendorId, venueId, date, bookingId = null, blockId = null) => {
  const venue = await findVenueByVendor(venueId, vendorId);
  if (!venue) throw new AppError('Venue not found or unauthorized', 403);

  const existingOverride = await slotOverrideRepository.findOverrideByVenueAndDate(venueId, date);
  if (!existingOverride) throw new AppError('Override not found', 404);

  if (bookingId) {
    const slot = existingOverride.blocks.find(s => s.bookingId && s.bookingId.toString() === bookingId.toString());
    if (slot && slot.reason === 'Customer Booking') throw new AppError('Vendors cannot remove customer bookings', 400);
    await slotOverrideRepository.pullHourlySlotByBookingId(venueId, date, bookingId);
  } else if (blockId) {
    const slot = existingOverride.blocks.find(s => s._id && s._id.toString() === blockId.toString());
    if (slot && slot.reason === 'Customer Booking') throw new AppError('Vendors cannot remove customer bookings', 400);
    if (slot) {
      await slotOverrideRepository.pullHourlySlotByBlockId(venueId, date, blockId);
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
