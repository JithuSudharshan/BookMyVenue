import mongoose from 'mongoose';

const vendorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One-to-one relationship
    },

    // --- Onboarding Flow ---
    onboardingStatus: {
      type: String,
      enum: ['incomplete', 'under_review', 'approved', 'rejected', 'changes_requested'],
      default: 'incomplete',
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },

    // --- Step 1: Personal & Contact ---
    // firstName/lastName kept for compatibility with signup flow & dashboard display
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    // fullName is the single source of truth collected during onboarding
    fullName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    phone: {
      type: String,
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: 'default.jpg',
    },

    // --- Step 2: Address & Role ---
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    roleInBusiness: {
      type: String,
      enum: ['owner', 'co-owner', 'partner', 'manager', 'authorized_representative'],
    },

    // --- Step 3: Identity Verification ---
    identity: {
      documentType: {
        type: String,
        enum: ['aadhar', 'pan', 'driving_license', 'passport', 'voter_id'],
      },
      documentNumber: String,
      documentUrl: String, // Cloudinary URL
    },

    // --- Admin Review ---
    adminRemarks: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const VendorProfile = mongoose.model('VendorProfile', vendorProfileSchema);

export default VendorProfile;
