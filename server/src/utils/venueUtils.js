/**
 * venueUtils.js
 * Shared venue-related utilities used across multiple services.
 * Centralizing here avoids circular import issues.
 */

/**
 * Resolves the effective booking mode for a venue.
 *
 * Priority: top-level `bookingModel` (legacy seed field) over `bookingConfig.bookingMode`.
 * This ensures venues seeded with only `bookingModel` work correctly.
 *
 * This is the single source of truth for booking mode resolution.
 * Must be used consistently on both frontend (BookingWidget) and backend (all validators/services).
 */
export const getEffectiveBookingMode = (venue) => {
  return venue.bookingModel || venue.bookingConfig?.bookingMode || 'daily';
};
