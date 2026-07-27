import AvailabilityOverride from '../../models/availabilityOverrideModel.js';

export const findOverridesByVenueAndMonth = async (venueId, year, month) => {
  // Pad month to 2 digits if necessary
  const formattedMonth = month.toString().padStart(2, '0');
  const datePrefix = `${year}-${formattedMonth}`;
  
  return await AvailabilityOverride.find({
    venueId,
    date: { $regex: `^${datePrefix}` }
  }).lean();
};

export const findOverrideByVenueAndDate = async (venueId, date) => {
  return await AvailabilityOverride.findOne({ venueId, date }).lean();
};

export const findOverridesByVenueAndDates = async (venueId, dates) => {
  return await AvailabilityOverride.find({ venueId, date: { $in: dates } }).lean();
};

export const upsertFullDayOverride = async (venueId, date, updateData) => {
  return await AvailabilityOverride.findOneAndUpdate(
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
    await AvailabilityOverride.bulkWrite(bulkOps);
  }
  
  // Return the updated documents
  return await AvailabilityOverride.find({ venueId, date: { $in: dates } }).lean();
};

export const pushHourlySlot = async (venueId, date, slotData) => {
  return await AvailabilityOverride.findOneAndUpdate(
    { venueId, date },
    { $push: { blocks: slotData } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const pullHourlySlotByBookingId = async (venueId, date, bookingId) => {
  return await AvailabilityOverride.updateOne(
    { venueId, date },
    { $pull: { blocks: { bookingId } } }
  );
};


export const pullHourlySlotByBlockId = async (venueId, date, blockId) => {
  return await AvailabilityOverride.updateOne(
    { venueId, date },
    { $pull: { blocks: { _id: blockId } } }
  );
};

// If we need to pull by something other than bookingId (e.g. fromTime and toTime), we can add it here.
export const pullHourlySlotByTime = async (venueId, date, fromTime, toTime) => {
  return await AvailabilityOverride.updateOne(
    { venueId, date },
    { $pull: { blocks: { fromTime, toTime } } }
  );
};

export const deleteOverride = async (venueId, date) => {
  return await AvailabilityOverride.deleteOne({ venueId, date });
};
