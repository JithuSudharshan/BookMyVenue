import * as slotManagementService from '../../services/vendor/slotManagementService.js';

export const getMonthOverview = async (req, res, next) => {
  try {
    const { id: venueId } = req.params;
    const { year, month } = req.query;
    const vendorId = req.user._id;
    const data = await slotManagementService.getMonthOverview(vendorId, venueId, year, month);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const blockDailySlots = async (req, res, next) => {
  try {
    const { id: venueId } = req.params;
    const { dates, reason } = req.body;
    const vendorId = req.user._id;
    const data = await slotManagementService.blockDailySlots(vendorId, venueId, dates, reason);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const blockHourlySlot = async (req, res, next) => {
  try {
    const { id: venueId } = req.params;
    const { date, fromTime, toTime, reason } = req.body;
    const vendorId = req.user._id;
    const data = await slotManagementService.blockHourlySlot(vendorId, venueId, date, fromTime, toTime, reason);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const removeOverride = async (req, res, next) => {
  try {
    const { id: venueId } = req.params;
    const { date, bookingId, slotIndex } = req.body;
    const vendorId = req.user._id;
    const data = await slotManagementService.removeOverride(vendorId, venueId, date, bookingId, slotIndex);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const acknowledgeSlots = async (req, res, next) => {
  try {
    const { id: venueId } = req.params;
    const vendorId = req.user._id;
    const data = await slotManagementService.acknowledgeSlots(vendorId, venueId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
