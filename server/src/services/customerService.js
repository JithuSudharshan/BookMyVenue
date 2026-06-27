import cloudinary from '../config/cloudinary.js';
import userRepository from '../repositories/userRepository.js';
import * as customerRepository from '../repositories/customerRepository.js';
import AppError from '../utils/AppError.js';

/**
 * Extract Cloudinary public ID from secure URL.
 * @param {string} url - The Cloudinary secure URL
 * @returns {string|null} - The extracted public ID or null
 */
const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;

  const afterUpload = parts[1];
  const versionMatch = afterUpload.match(/^v\d+\/(.+)$/);
  const relativePath = versionMatch ? versionMatch[1] : afterUpload;
  
  return relativePath.split('.').slice(0, -1).join('.');
};

/**
 * Format and flatten customer profile details for client response.
 * @param {Object} user - The user document
 * @param {Object} customer - The customer profile document
 * @returns {Object} - Flattened customer profile
 */
const formatCustomerProfile = (user, customer) => {
  const customerObj = customer?.toObject ? customer.toObject() : (customer || {});
  const address = customerObj.address || {};

  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    firstName: customerObj.firstName || '',
    lastName: customerObj.lastName || '',
    phone: customerObj.phone || '',
    profileImage: customerObj.profileImage || null,
    street: address.street || '',
    city: address.city || '',
    district: address.district || '',
    state: address.state || '',
    pinCode: address.pinCode || '',
    country: address.country || 'India',
    wishlist: customerObj.wishlist || [],
    bookings: customerObj.bookings || [],
  };
};

/**
 * Fetch Customer Profile details.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<Object>} - The formatted customer profile
 * @throws {AppError} - If user is not found or unauthorized
 */
export const getCustomerProfile = async (userId) => {
  if (!userId) {
    throw new AppError('Unauthorized. User ID not found.', 401);
  }

  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const customer = await customerRepository.findByUserId(userId);
  return formatCustomerProfile(user, customer);
};

/**
 * Update only personal information fields (firstName, lastName, phone).
 * @param {string} userId
 * @param {Object} data - { firstName, lastName, phone }
 * @returns {Promise<Object>} - The updated formatted customer profile
 */
export const updatePersonalInfo = async (userId, data) => {
  if (!userId) throw new AppError('Unauthorized. User ID not found.', 401);

  const user = await userRepository.findUserById(userId);
  if (!user) throw new AppError('User not found.', 404);

  const allowedFields = ['firstName', 'lastName', 'phone'];
  const cleanedUpdate = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      cleanedUpdate[field] = data[field];
    }
  }

  const updatedCustomer = await customerRepository.findOneAndUpdate(
    { userId },
    { $set: cleanedUpdate },
    { upsert: true }
  );

  return formatCustomerProfile(user, updatedCustomer);
};

/**
 * Update only address fields (street, city, district, state, pinCode, country).
 * @param {string} userId
 * @param {Object} data - { street, city, district, state, pinCode, country }
 * @returns {Promise<Object>} - The updated formatted customer profile
 */
export const updateAddress = async (userId, data) => {
  if (!userId) throw new AppError('Unauthorized. User ID not found.', 401);

  const user = await userRepository.findUserById(userId);
  if (!user) throw new AppError('User not found.', 404);

  const currentCustomer = await customerRepository.findByUserId(userId);
  const currentAddress = currentCustomer?.address || {};

  const address = {
    street: data.street ?? currentAddress.street,
    city: data.city ?? currentAddress.city,
    district: data.district ?? currentAddress.district,
    state: data.state ?? currentAddress.state,
    pinCode: data.pinCode ?? currentAddress.pinCode,
    country: data.country ?? currentAddress.country ?? 'India',
  };

  const updatedCustomer = await customerRepository.findOneAndUpdate(
    { userId },
    { $set: { address } },
    { upsert: true }
  );

  return formatCustomerProfile(user, updatedCustomer);
};

/**
 * Update Customer Profile details and sync Customer collection.
 * @param {string} userId - The unique identifier of the user
 * @param {Object} updateData - The fields to update
 * @returns {Promise<Object>} - The updated and formatted customer profile
 * @throws {AppError} - If user is not found or unauthorized
 */
export const updateCustomerProfile = async (userId, updateData) => {
  if (!userId) {
    throw new AppError('Unauthorized. User ID not found.', 401);
  }

  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Pick allowed fields dynamically
  const allowedFields = ['firstName', 'lastName', 'phone', 'profileImage'];
  const cleanedUpdate = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      cleanedUpdate[field] = updateData[field];
    }
  }

  // Handle nested address fields
  const addressFields = [
    'street', 'city', 'district', 
    'state', 'pinCode', 'country'
  ];
  const hasAddressUpdate = addressFields.some(field => updateData[field] !== undefined);

  if (hasAddressUpdate) {
    const currentCustomer = await customerRepository.findByUserId(userId);
    const currentAddress = currentCustomer?.address || {};
    
    cleanedUpdate.address = {
      street: updateData.street ?? currentAddress.street,
      city: updateData.city ?? currentAddress.city,
      district: updateData.district ?? currentAddress.district,
      state: updateData.state ?? currentAddress.state,
      pinCode: updateData.pinCode ?? currentAddress.pinCode,
      country: updateData.country ?? currentAddress.country ?? 'India',
    };
  }

  const updatedCustomer = await customerRepository.findOneAndUpdate(
    { userId },
    { $set: cleanedUpdate },
    { upsert: true }
  );

  return formatCustomerProfile(user, updatedCustomer);
};

/**
 * Upload and replace customer avatar in Cloudinary and the database.
 * @param {string} userId - The unique identifier of the user
 * @param {Object} file - The file object provided by multer
 * @returns {Promise<Object>} - Object containing the new profileImage URL
 * @throws {AppError} - If upload fails, user is not found, or file is missing
 */
export const updateAvatar = async (userId, file) => {
  if (!userId) {
    throw new AppError('Unauthorized. User ID not found.', 401);
  }

  if (!file) {
    throw new AppError('Please upload an image file.', 400);
  }

  const customer = await customerRepository.findByUserId(userId);
  if (!customer) {
    throw new AppError('Customer profile not found.', 404);
  }

  const imageUrl = file.path || file.secure_url;

  // Delete previous avatar from Cloudinary if it exists
  if (customer.profileImage) {
    const oldPublicId = extractPublicId(customer.profileImage);
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (destroyError) {
        console.error('Failed to destroy old Cloudinary image:', destroyError);
      }
    }
  }

  customer.profileImage = imageUrl;
  await customer.save();

  return { profileImage: customer.profileImage };
};

/**
 * Remove avatar from Cloudinary and the database.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<Object>} - Object indicating profileImage is null
 * @throws {AppError} - If user is not found or unauthorized
 */
export const deleteAvatar = async (userId) => {
  if (!userId) {
    throw new AppError('Unauthorized. User ID not found.', 401);
  }

  const customer = await customerRepository.findByUserId(userId);
  if (!customer) {
    throw new AppError('Customer profile not found.', 404);
  }

  if (customer.profileImage) {
    const publicId = extractPublicId(customer.profileImage);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (destroyError) {
        console.error('Failed to destroy Cloudinary image:', destroyError);
      }
    }
    
    customer.profileImage = null;
    await customer.save();
  }

  return { profileImage: null };
};
