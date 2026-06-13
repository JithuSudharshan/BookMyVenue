import {
  loginAdminService,
  getUsersService,
  getVendorsService,
  blockUserService,
  unblockUserService,
  verifyVendorService,
  getDashboardStatsService,
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
    const users = await getUsersService();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await getVendorsService();

    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const user = await blockUserService(req.params.id);

    res.status(200).json({
      message: "User blocked successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const user = await unblockUserService(req.params.id);

    res.status(200).json({
      message: "User unblocked successfully",
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
    const { status, rejectReason } = req.body;
    const vendor = await verifyVendorService(req.params.id, status, rejectReason);
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
