import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user reference'],
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Please add a venue reference'],
    },
    slotIds: [
      {
        type: String, // Assuming slot IDs or time references will be strings or ObjectIds
      },
    ],
    bookingDate: {
      type: Date,
      required: [true, 'Please provide a booking date'],
    },
    guestCount: {
      type: Number,
      required: [true, 'Please provide the guest count'],
      min: [1, 'At least 1 guest is required'],
    },
    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Completed', 'Refunded'],
      default: 'Pending',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please provide the total amount'],
      min: [0, 'Total amount cannot be negative'],
    },
    advanceAmount: {
      type: Number,
      required: [true, 'Please provide the advance amount'],
      min: [0, 'Advance amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
