import {
  getAdminVenuesService,
  getAdminVenueByIdService,
  updateVenueStatusService,
  updateVenueVisibilityService,
} from "../../services/admin/adminVenueService.js";

export const getAdminVenues = async (req, res) => {
  try {
    const search = req.query.search || req.query.q || "";
    const status = req.query.status || "All";
    const visibility = req.query.visibility || "";
    const sort = req.query.sort || "";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { data, total } = await getAdminVenuesService({ search, status, visibility, sort, page, limit });

    res.status(200).json({
      data,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminVenueById = async (req, res) => {
  try {
    const venue = await getAdminVenueByIdService(req.params.id);
    res.status(200).json(venue);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateVenueStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const venue = await updateVenueStatusService(req.params.id, status, rejectionReason, req.user._id);
    res.status(200).json({
      message: `Venue status updated to ${status}`,
      venue,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVenueVisibility = async (req, res) => {
  try {
    const { venueStatus } = req.body;
    const venue = await updateVenueVisibilityService(req.params.id, venueStatus);
    res.status(200).json({
      message: `Venue visibility updated to ${venueStatus}`,
      venue,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
