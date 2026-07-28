import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: [true, 'Wallet reference is required'],
    },
    transactionType: {
      type: String,
      enum: ['Credit', 'Debit'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    referenceType: {
      type: String,
      required: true,
      default: 'Unknown' // Usually 'BookingRefund', 'BookingPayment', 'Deposit', etc.
    },
    referenceId: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String like REFUND:<bookingId>:wallet
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to guarantee database-level idempotency
walletTransactionSchema.index(
  { referenceType: 1, referenceId: 1, transactionType: 1 },
  { unique: true, partialFilterExpression: { referenceId: { $type: "string" } } } 
  // we could also just make it unique always, but some legacy data might have nulls or duplicate ObjectIds
);

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;
