/**
 * bookingConstants.js
 * Centralized state machine constants for the Booking Lifecycle.
 * These map exactly to the Mongoose lowercase schema enum definitions.
 */

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REFUND_PENDING: 'refund_pending',
  REFUNDED: 'refunded'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  COMPLETED: 'completed',
  REFUNDED: 'refunded'
};

export const TRANSACTION_TYPE = {
  CREDIT: 'Credit',
  DEBIT: 'Debit'
};

export const REFUND_DESTINATION = {
  WALLET: 'wallet',
  RAZORPAY: 'razorpay'
};

export const NOTIFICATION_EVENTS = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_CANCELLED: 'booking_cancelled',
  REFUND_PROCESSED: 'refund_processed'
};

export const USER_ROLES = {
  CUSTOMER: 'user',
  VENDOR: 'vendor',
  ADMIN: 'admin'
};

export const DOMAIN_EVENTS = {
  BOOKING_CONFIRMED: 'BookingConfirmed',
  BOOKING_CANCELLED: 'BookingCancelled',
  REFUND_PROCESSED: 'RefundProcessed',
  VENDOR_APPROVED: 'VendorApproved',
  VENUE_STATUS_CHANGED: 'VenueStatusChanged',
  PAYMENT_FAILED: 'PaymentFailed',
  BOOKING_EXPIRED: 'BookingExpired',
  AVAILABILITY_RELEASED: 'AvailabilityReleased',
  BALANCE_REQUESTED: 'BalanceRequested',
  BALANCE_PAID: 'BalancePaid',
  BOOKING_COMPLETED: 'BookingCompleted'
};
