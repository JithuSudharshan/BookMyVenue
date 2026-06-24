import VendorProfile from '../models/VendorProfile.js';

class VendorRepository {
  async getProfileByUserId(userId) {
    return await VendorProfile.findOne({ userId }).populate('userId', 'email');
  }

  async updateProfile(userId, updateData) {
    return await VendorProfile.findOneAndUpdate(
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
    return await this.updateProfile(userId, { onboardingStatus: 'under_review' });
  }
}

export default new VendorRepository();
