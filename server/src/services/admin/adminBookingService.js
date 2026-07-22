import {
  getAllBookings,
  getBookingById,
  getBookingStats,
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
 * Retrieves aggregated booking count statistics.
 * @returns {Promise<Object>} Status breakdown counts.
 */
export const getAdminBookingStatsService = async () => {
  return await getBookingStats();
};
