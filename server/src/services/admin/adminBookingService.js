import {
  getAllBookings,
  getBookingById,
  getBookingStats,
  cancelBookingById,
} from "../../repositories/admin/adminBookingRepository.js";

/**
 * Retrieves a list of bookings filtered, searched, and paginated.
 * @param {Object} options - Query filters and pagination options.
 * @returns {Promise<Object>} The bookings data and pagination info.
 */
export const getAdminBookingsService = async (options) => {
  return await getAllBookings(options);
};

/**
 * Retrieves the details of a single booking by ID.
 * @param {string} id - The booking ID.
 * @returns {Promise<Object>} The booking document populated with references.
 * @throws {Error} If booking is not found.
 */
export const getAdminBookingByIdService = async (id) => {
  const booking = await getBookingById(id);
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
};

/**
 * Cancels a single booking by ID and liberates its slots.
 * @param {string} id - The booking ID.
 * @param {Object} details - Cancellation reasons.
 * @returns {Promise<Object>} The updated booking document.
 */
export const cancelAdminBookingService = async (id, { cancellationReason, cancellationDescription }) => {
  const booking = await cancelBookingById(id, { cancellationReason, cancellationDescription });
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
};

/**
 * Aggregates booking statistics.
 */
export const getAdminBookingStatsService = async () => {
  return await getBookingStats();
};
