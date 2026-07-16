import Vendor from '../models/vendorModel.js';

class VendorRepository {
  async getProfileByUserId(userId) {
    return await Vendor.findOne({ userId }).populate('userId', 'email');
  }

  async updateProfile(userId, updateData) {
    return await Vendor.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async updateOnboardingStep(userId, step, data) {
    const updateData = { ...data };
    
    // Always advance step unless we are on the last step
    const currentProfile = await this.getProfileByUserId(userId);
    if (currentProfile && currentProfile.onboardingStep < step) {
        updateData.onboardingStep = step;
    }

    return await this.updateProfile(userId, updateData);
  }

  async submitForReview(userId) {
    const currentProfile = await this.getProfileByUserId(userId);
    const nextStatus = currentProfile && currentProfile.onboardingStatus === 'rejected' ? 'changes_requested' : 'requested';
    return await this.updateProfile(userId, { onboardingStatus: nextStatus });
  }
}

export default new VendorRepository();
