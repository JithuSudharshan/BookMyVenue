export const BOOKING_MODELS = ["daily", "hourly"];

export const APPROVAL_STATUS = [
  "draft",
  "submitted",
  "approved",
  "rejected"
];

export const VENUE_STATUS = [
  "active",
  "inactive"
];

export const VENDOR_SLOT_REASONS = ['Maintenance', 'Offline Booking', 'Other'];
export const SLOT_REASONS = [...VENDOR_SLOT_REASONS, 'Customer Booking'];
export const DEFAULT_BOOKING_INTERVAL = 60;
