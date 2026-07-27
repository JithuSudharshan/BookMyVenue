import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per booking
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must not exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment must not exceed 1000 characters'],
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for public venue reviews listing
reviewSchema.index({ venueId: 1, isVisible: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
