import {
  getAdminBookingsService,
  getAdminBookingByIdService,
  getAdminBookingStatsService,
  cancelAdminBookingService,
} from "../../services/admin/adminBookingService.js";

/**
 * Get all bookings with filtering, search, and pagination.
 */
export const getAdminBookings = async (req, res) => {
  try {
    const search = req.query.search || "";
    const bookingStatus = req.query.bookingStatus || "All";
    const date = req.query.date || "";
    const sort = req.query.sort || "";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await getAdminBookingsService({
      search,
      bookingStatus,
      date,
      sort,
      page,
      limit,
    });

    res.status(200).json({
      data: result.bookings,
      pagination: {
        totalItems: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        itemsPerPage: result.limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Get single booking by its ID.
 */
export const getAdminBookingById = async (req, res) => {
  try {
    const booking = await getAdminBookingByIdService(req.params.id);
    res.status(200).json(booking);
  } catch (error) {
    res.status(error.message === "Booking not found" ? 404 : 500).json({
      message: error.message,
    });
  }
};

/**
 * Cancel a booking by its ID.
 */
export const cancelAdminBooking = async (req, res) => {
  try {
    const { cancellationReason, cancellationDescription } = req.body;
    const booking = await cancelAdminBookingService(req.params.id, {
      cancellationReason,
      cancellationDescription,
    });
    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.message === "Booking not found" ? 404 : 500);
    res.status(statusCode).json({
      message: error.message,
    });
  }
};

/**
 * Get booking dashboard statistics.
 */
export const getAdminBookingStats = async (req, res) => {
  try {
    const stats = await getAdminBookingStatsService();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
