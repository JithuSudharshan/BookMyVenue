import mongoose from 'mongoose';
import { SLOT_REASONS } from '../utils/venueConstants.js';

const blockSchema = new mongoose.Schema({
  fromTime:  { type: String, required: true },
  toTime:    { type: String, required: true },
  reason:    { type: String, enum: SLOT_REASONS, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
}, { _id: false });

const availabilityOverrideSchema = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
  date:    { type: String, required: true, index: true }, // 'YYYY-MM-DD'
  isFullDayBlocked: { type: Boolean, default: false },
  fullDayReason:    { type: String, enum: SLOT_REASONS, default: null },
  blocks: [blockSchema],
}, { timestamps: true });

availabilityOverrideSchema.index({ venueId: 1, date: 1 }, { unique: true });

export default mongoose.model('AvailabilityOverride', availabilityOverrideSchema);
