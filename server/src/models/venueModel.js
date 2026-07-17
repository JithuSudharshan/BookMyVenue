import mongoose from 'mongoose';
import { BOOKING_MODELS } from '../utils/venueConstants.js';

function isStrict() {
    // Only enforce required fields if the venue is NOT a draft or rejected
    return ['submitted', 'under_review', 'approved'].includes(this.approval?.status);
}

const venueSchema = new mongoose.Schema(
  {
    // ─── Ownership ───────────────────────────────────────────
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
      index: true,
    },

    // ─── Categorization ──────────────────────────────────────
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [isStrict, 'Category is required for submission'],
      index: true,
    },

    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: [isStrict, 'Subcategory is required for submission'],
      index: true,
    },

    // ─── Basic Info ──────────────────────────────────────────
    name: {
      type: String,
      required: [isStrict, 'Please add a venue name'],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: [isStrict, 'Slug is required for submission'],
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true, // Allow multiple drafts with undefined slugs
    },

    description: {
      type: String,
      required: [isStrict, 'Please add a description'],
      maxlength: 2000,
    },

    // ─── Gallery ─────────────────────────────────────────────
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ─── Location ────────────────────────────────────────────
    location: {
      address: {
        type: String,
        required: [isStrict, 'Address is required for submission'],
      },
      city: {
        type: String,
        required: [isStrict, 'City is required for submission'],
      },
      state: {
        type: String,
        required: [isStrict, 'State is required for submission'],
      },
      pincode: {
        type: String,
        required: [isStrict, 'Pincode is required for submission'],
      },
    },

    // ─── Venue Details ───────────────────────────────────────
    capacity: {
      type: Number,
      required: [isStrict, 'Capacity is required for submission'],
      min: 1,
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    price: {
      type: Number,
      required: [isStrict, 'Price is required for submission'],
      min: 0,
    },

    // ─── Booking Configuration ───────────────────────────────
    bookingModel: {
      type: String,
      enum: BOOKING_MODELS,
      default: 'daily',
    },

    bookingConfig: {
      openingTime: String,
      closingTime: String,
    },

    // ─── Rules ───────────────────────────────────────────────
    rules: [
      {
        type: String,
      },
    ],

    // ─── Admin Approval ──────────────────────────────────────
    approval: {
      status: {
        type: String,
        enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
        default: 'draft',
        index: true,
      },
      submittedAt: {
        type: Date,
        default: null,
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      rejectionReason: {
        type: String,
        default: null,
      },
    },

    // ─── Visibility ──────────────────────────────────────────
    venueStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation for images length when submitted
venueSchema.pre('validate', function(next) {
    if (isStrict.call(this) && (!this.images || this.images.length < 3)) {
        this.invalidate('images', 'At least 3 images are required for submission');
    }
    next();
});

const Venue = mongoose.model('Venue', venueSchema);

export default Venue;
