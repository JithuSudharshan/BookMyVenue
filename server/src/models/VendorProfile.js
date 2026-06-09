import mongoose from 'mongoose';

const vendorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One-to-one relationship
    },
    businessName: {
      type: String,
      required: [true, 'Please add a business name'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Please add the owner name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a business phone number'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    GSTNumber: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    documents: [
      {
        name: String,
        url: String, // Path or URL to the uploaded document
      },
    ],
    location: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      // GeoJSON could be added here for map features
    },
    amenities: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const VendorProfile = mongoose.model('VendorProfile', vendorProfileSchema);

export default VendorProfile;
