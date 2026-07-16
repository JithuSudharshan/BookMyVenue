import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    ownerType: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      required: [true, 'Owner type is required'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one wallet per owner
walletSchema.index({ ownerId: 1 }, { unique: true });

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
