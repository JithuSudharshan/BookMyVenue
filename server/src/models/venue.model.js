import mongoose from 'mongoose';
import { BOOKING_MODELS, APPROVAL_STATUS, VENUE_STATUS } from '../utils/venue.constants.js';

const venueSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming the vendor is managed in the User model or a separate Vendor model
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
  },
  name: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple drafts with no slug or undefined slug
    trim: true,
  },
  description: {
    type: String,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      isPrimary: {
        type: Boolean,
        default: false,
      }
    }
  ],
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
  },
  capacity: {
    type: Number,
  },
  amenities: [
    { type: String }
  ],
  price: {
    type: Number,
  },
  bookingModel: {
    type: String,
    enum: BOOKING_MODELS,
  },
  bookingConfig: {
    openingTime: { type: String },
    closingTime: { type: String }
  },
  rules: [
    { type: String }
  ],
  approval: {
    status: {
      type: String,
      enum: APPROVAL_STATUS,
      default: 'draft',
    },
    rejectionReason: {
      type: String,
    }
  },
  venueStatus: {
    type: String,
    enum: VENUE_STATUS,
    default: 'inactive', // New venues can default to inactive until approved or manually activated
  }
}, { timestamps: true });

// Add Indexes for fast querying
venueSchema.index({ vendorId: 1 });
venueSchema.index({ categoryId: 1 });
venueSchema.index({ subcategoryId: 1 });
venueSchema.index({ 'approval.status': 1 });
venueSchema.index({ venueStatus: 1 });

const Venue = mongoose.model('Venue', venueSchema);
export default Venue;
