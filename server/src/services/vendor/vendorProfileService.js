import vendorRepository from '../../repositories/vendorRepository.js';
import { deleteIdentityDocFromCloudinary } from '../../utils/cloudinaryUpload.js';

export const getOnboardingStatusService = async (userId) => {
  const profile = await vendorRepository.getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Vendor profile not found');
  }
  return {
    onboardingStatus: profile.onboardingStatus,
    onboardingStep: profile.onboardingStep,
    adminRemarks: profile.adminRemarks,
  };
};

export const saveStep1Service = async (userId, data, file) => {
  if (file && file.path) {
    data.profileImage = file.path;
  }
  return await vendorRepository.updateOnboardingStep(userId, 1, data);
};

export const saveStep2Service = async (userId, data) => {
  return await vendorRepository.updateOnboardingStep(userId, 2, data);
};

export const saveStep3Service = async (userId, data, file) => {
  const updateData = {
    'identity.documentType': data.documentType,
    'identity.documentNumber': data.documentNumber,
  };
  
  if (file && file.path) {
    updateData['identity.documentUrl'] = file.path;
  }
  return await vendorRepository.updateOnboardingStep(userId, 3, updateData);
};

export const submitForReviewService = async (userId) => {
  return await vendorRepository.submitForReview(userId);
};

export const getVendorProfileService = async (userId) => {
  const profile = await vendorRepository.getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Vendor profile not found');
  }
  return profile;
};

export const updateAvatarService = async (userId, file) => {
  if (!file || !file.path) {
    throw new Error('No file uploaded');
  }
  return await vendorRepository.updateProfile(userId, { profileImage: file.path });
};

export const deleteAvatarService = async (userId) => {
  return await vendorRepository.updateProfile(userId, { profileImage: '' });
};

export const updateProfileService = async (userId, data) => {
  const { personalInfo, address } = data;
  let updateData = {};
  
  if (personalInfo) {
    updateData = { ...personalInfo };
  }
  if (address) {
    updateData = { address };
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid data provided to update');
  }

  return await vendorRepository.updateProfile(userId, updateData);
};

export const updateIdentityService = async (userId, data, file) => {
  const { roleInBusiness, documentType, documentNumber } = data;
  const updateData = {};
  
  if (roleInBusiness) updateData.roleInBusiness = roleInBusiness;
  if (documentType)   updateData['identity.documentType']   = documentType;
  if (documentNumber) updateData['identity.documentNumber'] = documentNumber;

  const existingProfile = await vendorRepository.getProfileByUserId(userId);

  if (file && file.path) {
    const oldUrl = existingProfile?.identity?.documentUrl;
    if (oldUrl) {
      await deleteIdentityDocFromCloudinary(oldUrl);
    }
    updateData['identity.documentUrl'] = file.path;
  }

  return await vendorRepository.updateProfile(userId, updateData);
};
