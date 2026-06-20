import Customer from '../models/Customer.js';

export const findByPhone = async (phone) => {
  return await Customer.findOne({ phone });
};

export const findByUserId = async (userId) => {
  return await Customer.findOne({ userId });
};

export const create = async (profileData) => {
  return await Customer.create(profileData);
};

export const findOneAndUpdate = async (filter, update, options = {}) => {
  return await Customer.findOneAndUpdate(filter, update, { new: true, ...options });
};
