import User from '../models/User.js';
import CustomerProfile from '../models/CustomerProfile.js';
import VendorProfile from '../models/VendorProfile.js';

class UserRepository {
  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  async findUserByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findUserById(id, includePassword = false) {
    if (includePassword) {
      return await User.findById(id).select('+password');
    }
    return await User.findById(id);
  }

  async findUserByIdWithoutPassword(id) {
    return await User.findById(id).select('-password');
  }

  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async createCustomerProfile(profileData) {
    const profile = new CustomerProfile(profileData);
    return await profile.save();
  }

  async createVendorProfile(profileData) {
    const profile = new VendorProfile(profileData);
    return await profile.save();
  }

  async findCustomerProfileByPhone(phone) {
    return await CustomerProfile.findOne({ phone });
  }

  async findCustomerProfileByUserId(userId) {
    return await CustomerProfile.findOne({ user: userId });
  }

  async findVendorProfileByUserId(userId) {
    return await VendorProfile.findOne({ user: userId });
  }

  async saveUser(userDoc) {
    return await userDoc.save();
  }
}

export default new UserRepository();
