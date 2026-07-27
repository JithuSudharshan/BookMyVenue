import {
  getVendorsService,
  getVendorByIdService,
  verifyVendorService,
} from "../../services/admin/adminVendorService.js";
import notificationService from '../../services/notificationService.js';

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

export const verifyVendor = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const vendor = await verifyVendorService(req.params.id, status, adminRemarks);

    // Notify the vendor
    let notificationType = 'INFO';
    let message = `Your onboarding profile status has been updated to ${status}.`;
    
    if (status === 'approved') {
      notificationType = 'SUCCESS';
      message = `Congratulations! Your vendor profile has been approved.`;
    } else if (status === 'rejected' || status === 'changes_requested') {
      notificationType = 'WARNING';
      message = `Your vendor profile needs attention. Remarks: ${adminRemarks}`;
    }

    notificationService.sendNotification({
        recipient: vendor.userId, // vendor document has userId linking to their User account
        title: `Onboarding Profile ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message,
        type: notificationType,
        link: `/vendor` // Link back to vendor profile page
    });

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
