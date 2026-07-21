import vendorRepository from '../repositories/vendorRepository.js';
import { deleteIdentityDocFromCloudinary } from '../utils/cloudinaryUpload.js';

export const getOnboardingStatus = async (req, res) => {
  try {
    const profile = await vendorRepository.getProfileByUserId(req.user._id);
    if (!profile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    res.json({
      onboardingStatus: profile.onboardingStatus,
      onboardingStep: profile.onboardingStep,
      adminRemarks: profile.adminRemarks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const saveStep1 = async (req, res) => {
  try {
    const { fullName, phone, email, dateOfBirth, gender, alternatePhone } = req.body;
    let profileImage;
    if (req.file && req.file.path) {
      profileImage = req.file.path;
    }

    const data = {
      fullName,
      phone,
      email,
      dateOfBirth,
      gender,
      alternatePhone,
    };
    if (profileImage) {
      data.profileImage = profileImage;
    }

    const updatedProfile = await vendorRepository.updateOnboardingStep(req.user._id, 1, data);
    res.json({ message: 'Step 1 saved successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const saveStep2 = async (req, res) => {
  try {
    const { address, roleInBusiness } = req.body;
    
    const data = {
      address,
      roleInBusiness,
    };

    const updatedProfile = await vendorRepository.updateOnboardingStep(req.user._id, 2, data);
    res.json({ message: 'Step 2 saved successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const saveStep3 = async (req, res) => {
  try {
    const { documentType, documentNumber } = req.body;
    let documentUrl;
    
    if (req.file && req.file.path) {
      documentUrl = req.file.path;
    }

    const data = {
      'identity.documentType': documentType,
      'identity.documentNumber': documentNumber,
    };
    
    if (documentUrl) {
      data['identity.documentUrl'] = documentUrl;
    }

    const updatedProfile = await vendorRepository.updateOnboardingStep(req.user._id, 3, data);
    res.json({ message: 'Step 3 saved successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const submitForReview = async (req, res) => {
  try {
    const updatedProfile = await vendorRepository.submitForReview(req.user._id);
    res.json({ message: 'Profile submitted for review successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const profile = await vendorRepository.getProfileByUserId(req.user._id);
    if (!profile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const updatedVendor = await vendorRepository.updateProfile(req.user._id, { profileImage: req.file.path });
    res.json({ success: true, url: req.file.path, vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const updatedVendor = await vendorRepository.updateProfile(req.user._id, { profileImage: '' });
    res.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { personalInfo, address } = req.body;
    
    let data = {};
    if (personalInfo) {
      data = { ...personalInfo };
    }
    if (address) {
      data = { address };
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No valid data provided to update' });
    }

    const updatedVendor = await vendorRepository.updateProfile(req.user._id, data);
    res.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateIdentity = async (req, res) => {
  try {
    const { roleInBusiness, documentType, documentNumber } = req.body;

    const data = {};
    if (roleInBusiness) data.roleInBusiness = roleInBusiness;
    if (documentType)   data['identity.documentType']   = documentType;
    if (documentNumber) data['identity.documentNumber'] = documentNumber;

    const existingProfile = await vendorRepository.getProfileByUserId(req.user._id);

    if (req.file && req.file.path) {
      // Delete the old document from Cloudinary before saving the new one
      const oldUrl = existingProfile?.identity?.documentUrl;
      if (oldUrl) {
        await deleteIdentityDocFromCloudinary(oldUrl);
      }
      data['identity.documentUrl'] = req.file.path;
    }

    const updatedVendor = await vendorRepository.updateProfile(req.user._id, data);
    res.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
