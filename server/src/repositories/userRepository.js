import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Vendor from '../models/Vendor.js';

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

  async createCustomer(profileData) {
    const profile = new Customer(profileData);
    return await profile.save();
  }

  async createVendor(profileData) {
    const profile = new Vendor(profileData);
    return await profile.save();
  }

  async findCustomerByPhone(phone) {
    return await Customer.findOne({ phone });
  }

  async findCustomerByUserId(userId) {
    return await Customer.findOne({ userId });
  }

  async findVendorByUserId(userId) {
    return await Vendor.findOne({ userId });
  }

  async saveUser(userDoc) {
    return await userDoc.save();
  }
}

export default new UserRepository();

