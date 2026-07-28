import AvailabilityOverride from '../../models/availabilityOverrideModel.js';

class AvailabilityService {
  /**
   * Releases availability overrides that were blocked by a booking.
   * This should be called within a transaction block for data consistency.
   * 
   * @param {Array<string>} slotIds - Array of ObjectIds (or stringified ObjectIds) representing the booked slots.
   * @param {Object} session - MongoDB session for transaction support.
   */
  async releaseBookingSlots(slotIds, session = null) {
    if (!slotIds || !slotIds.length) return false;

    const validSlotObjectIds = slotIds.filter(id => 
      id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id.toString())
    );

    if (validSlotObjectIds.length === 0) return false;

    await AvailabilityOverride.deleteMany(
      { _id: { $in: validSlotObjectIds } },
      { session }
    );

    return true;
  }
}

export default new AvailabilityService();
