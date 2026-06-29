
import mongoose from 'mongoose';

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
      required: true,
      index: true,
    },

    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
      index: true,
    },

    // ─── Basic Info ──────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Please add a venue name'],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    description: {
      type: String,
      required: [true, 'Please add a description'],
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
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },

    // ─── Venue Details ───────────────────────────────────────
    capacity: {
      type: Number,
      required: true,
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
      required: true,
      min: 0,
    },

    // ─── Booking Configuration ───────────────────────────────
    bookingModel: {
      type: String,
      enum: ['daily', 'hourly'],
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

const Venue = mongoose.model('Venue', venueSchema);

export default Venue;










































































// import mongoose from 'mongoose';

// const venueSchema = new mongoose.Schema(
//     {
//         vendorId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'VendorProfile',
//             required: true,
//             index: true,
//         },

//         categoryId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Category',
//             required: true,
//             index: true,
//         },

//         subcategoryId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'SubCategory',
//             required: true,
//             index: true,
//         },

//         name: {
//             type: String,
//             required: [true, 'Please add a venue name'],
//             trim: true,
//             maxlength: 200,
//         },

//         slug: {
//             type: String,
//             required: true,
//             trim: true,
//             lowercase: true,
//             unique: true,
//         },

//         description: {
//             type: String,
//             required: [true, 'Please add a description'],
//             maxlength: 2000,
//         },

//         images: [
//             {
//                 url: {
//                     type: String,
//                     required: true,
//                 },

//                 isPrimary: {
//                     type: Boolean,
//                     default: false,
//                 },
//             },
//         ],

//         location: {
//             address: {
//                 type: String,
//                 required: true,
//             },

//             city: {
//                 type: String,
//                 required: true,
//             },

//             state: {
//                 type: String,
//                 required: true,
//             },

//             pincode: {
//                 type: String,
//                 required: true,
//             },
//         },

//         capacity: {
//             type: Number,
//             required: true,
//             min: 1,
//         },

//         amenities: [
//             {
//                 type: String,
//                 trim: true,
//             },
//         ],

//         price: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         bookingModel: {
//             type: String,
//             enum: ['daily', 'hourly'],
//             default: 'daily',
//         },

//         bookingConfig: {
//             openingTime: String,
//             closingTime: String,
//         },

//         rules: [
//             {
//                 type: String,
//             },
//         ],

//         approval: {
//             status: {
//                 type: String,
//                 enum: [
//                     'draft',
//                     'submitted',
//                     'under_review',
//                     'approved',
//                     'rejected',
//                 ],
//                 default: 'draft',
//                 index: true,
//             },

//             submittedAt: {
//                 type: Date,
//                 default: null,
//             },

//             reviewedAt: {
//                 type: Date,
//                 default: null,
//             },

//             reviewedBy: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'User',
//                 default: null,
//             },

//             rejectionReason: {
//                 type: String,
//                 default: null,
//             },
//         },

//         venueStatus: {
//             type: String,
//             enum: ['active', 'inactive'],
//             default: 'inactive',
//             index: true,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// const Venue = mongoose.model('Venue', venueSchema);

// export default Venue;