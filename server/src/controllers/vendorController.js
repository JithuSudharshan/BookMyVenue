import * as vendorProfileService from '../services/vendor/vendorProfileService.js';
import * as vendorDashboardService from '../services/vendor/vendorDashboardService.js';

export const getOnboardingStatus = async (req, res) => {
  try {
    const data = await vendorProfileService.getOnboardingStatusService(req.user._id);
    res.json(data);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ message: error.message || 'Server error', error: error.message });
  }
};

export const saveStep1 = async (req, res) => {
  try {
    const updatedProfile = await vendorProfileService.saveStep1Service(req.user._id, req.body, req.file);
    res.json({ message: 'Step 1 saved successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const saveStep2 = async (req, res) => {
  try {
    const updatedProfile = await vendorProfileService.saveStep2Service(req.user._id, req.body);
    res.json({ message: 'Step 2 saved successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const saveStep3 = async (req, res) => {
  try {
    const updatedProfile = await vendorProfileService.saveStep3Service(req.user._id, req.body, req.file);
    res.json({ message: 'Step 3 saved successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitForReview = async (req, res) => {
  try {
    const updatedProfile = await vendorProfileService.submitForReviewService(req.user._id);
    res.json({ message: 'Profile submitted for review successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const profile = await vendorProfileService.getVendorProfileService(req.user._id);
    res.json(profile);
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ message: error.message || 'Server error', error: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const updatedVendor = await vendorProfileService.updateAvatarService(req.user._id, req.file);
    res.json({ success: true, url: req.file?.path, vendor: updatedVendor });
  } catch (error) {
    const statusCode = error.message.includes('No file') ? 400 : 500;
    res.status(statusCode).json({ message: error.message || 'Server error', error: error.message });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const updatedVendor = await vendorProfileService.deleteAvatarService(req.user._id);
    res.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updatedVendor = await vendorProfileService.updateProfileService(req.user._id, req.body);
    res.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    const statusCode = error.message.includes('No valid data') ? 400 : 500;
    res.status(statusCode).json({ message: error.message || 'Server error', error: error.message });
  }
};

export const updateIdentity = async (req, res) => {
  try {
    const updatedVendor = await vendorProfileService.updateIdentityService(req.user._id, req.body, req.file);
    res.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDashboardAnalytics = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const data = await vendorDashboardService.getDashboardDataService(req.user._id, timeRange);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
