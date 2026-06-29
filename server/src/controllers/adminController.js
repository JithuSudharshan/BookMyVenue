import {
  loginAdminService,
  getUsersService,
  getUserByIdService,
  getVendorsService,
  getVendorByIdService,
  updateUserBlockStatusService,
  verifyVendorService,
  getDashboardStatsService,
  getAdminVenuesService,
  getAdminVenueByIdService,
  updateVenueStatusService,
} from "../services/adminService.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await loginAdminService(email, password);

    res.status(200).json(admin);
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const search = req.query.search || req.query.q || "";
    const status = req.query.status || "All";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { data, total } = await getUsersService({ search, status, page, limit });

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
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const getVendors = async (req, res) => {
  try {
    const search = req.query.search || req.query.q || "";
    const status = req.query.status || "All";
    const accountStatus = req.query.accountStatus || "All";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { data, total } = await getVendorsService({ search, status, accountStatus, page, limit });

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
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await getVendorByIdService(req.params.id);
    res.status(200).json(vendor);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const updateUserBlockStatus = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await updateUserBlockStatusService(req.params.id, isBlocked);

    res.status(200).json({
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const verifyVendor = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const vendor = await verifyVendorService(req.params.id, status, adminRemarks);
    res.status(200).json({
      message: `Vendor verification status updated to ${status}`,
      vendor,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAdminVenues = async (req, res) => {
  try {
    const search = req.query.search || req.query.q || "";
    const status = req.query.status || "All";
    const sort = req.query.sort || "";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { data, total } = await getAdminVenuesService({ search, status, sort, page, limit });

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
