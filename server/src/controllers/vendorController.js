import vendorRepository from '../repositories/vendorRepository.js';

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
