import Slot from '../../models/slotModel.js';

export const findOverridesByVenueAndMonth = async (venueId, year, month) => {
  // Pad month to 2 digits if necessary
  const formattedMonth = month.toString().padStart(2, '0');
  const datePrefix = `${year}-${formattedMonth}`;
  
  return await Slot.find({
    venueId,
    date: { $regex: `^${datePrefix}` }
  }).lean();
};

export const findOverrideByVenueAndDate = async (venueId, date) => {
  return await Slot.findOne({ venueId, date }).lean();
};

export const findOverridesByVenueAndDates = async (venueId, dates) => {
  return await Slot.find({ venueId, date: { $in: dates } }).lean();
};

export const upsertFullDayOverride = async (venueId, date, updateData) => {
  return await Slot.findOneAndUpdate(
    { venueId, date },
    { $set: updateData },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const upsertManyFullDayOverrides = async (venueId, dates, updateData) => {
  // Use bulkWrite for efficient multiple upserts
  const bulkOps = dates.map((date) => ({
    updateOne: {
      filter: { venueId, date },
      update: { $set: updateData },
      upsert: true
    }
  }));

  if (bulkOps.length > 0) {
    await Slot.bulkWrite(bulkOps);
  }
  
  // Return the updated documents
  return await Slot.find({ venueId, date: { $in: dates } }).lean();
};

export const pushHourlySlot = async (venueId, date, slotData) => {
  return await Slot.findOneAndUpdate(
    { venueId, date },
    { $push: { blockedSlots: slotData } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const pullHourlySlotByBookingId = async (venueId, date, bookingId) => {
  return await Slot.updateOne(
    { venueId, date },
    { $pull: { blockedSlots: { bookingId } } }
  );
};


// If we need to pull by something other than bookingId (e.g. fromTime and toTime), we can add it here.
export const pullHourlySlotByTime = async (venueId, date, fromTime, toTime) => {
  return await Slot.updateOne(
    { venueId, date },
    { $pull: { blockedSlots: { fromTime, toTime } } }
  );
};

export const deleteOverride = async (venueId, date) => {
  return await Slot.deleteOne({ venueId, date });
};
