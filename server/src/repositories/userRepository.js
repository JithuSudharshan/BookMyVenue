import User from '../models/User.js';

export const findById = async (id) => {
  return await User.findById(id);
};

export const findOne = async (filter) => {
  return await User.findOne(filter);
};

export const create = async (userData) => {
  return await User.create(userData);
};

export const update = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
