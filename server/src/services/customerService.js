import cloudinary from '../config/cloudinary.js';
import * as userRepository from '../repositories/userRepository.js';
import * as customerRepository from '../repositories/customerRepository.js';

/**
 * Custom application error helper to generate standard JS Errors with HTTP status codes.
 * @param {number} status 
 * @param {string} message 
 * @returns {Error}
 */
const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Extract Cloudinary public ID from secure URL.
 * @param {string} url 
 * @returns {string|null}
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
 * @param {Object} user 
 * @param {Object} customer 
 * @returns {Object}
 */
const formatCustomerProfile = (user, customer) => {
  const customerObj = customer ? (customer.toObject ? customer.toObject() : customer) : {};
  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    firstName: customerObj.firstName || '',
    lastName: customerObj.lastName || '',
    phone: customerObj.phone || '',
    profileImage: customerObj.profileImage || '',
    addressStreet: customerObj.address?.street || '',
    addressCity: customerObj.address?.city || '',
    addressDistrict: customerObj.address?.district || '',
    addressState: customerObj.address?.state || '',
    addressZipCode: customerObj.address?.pinCode || '',
    addressCountry: customerObj.address?.country || 'India',
    wishlist: customerObj.wishlist || [],
    bookings: customerObj.bookings || [],
  };
};

/**
 * Fetch Customer Profile details
 * @param {String} userId 
 * @returns {Promise<Object>}
 */
export const getCustomerProfile = async (userId) => {
  if (!userId) {
    throw createError(401, 'Unauthorized. User ID not found.');
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw createError(404, 'User not found.');
  }

  const customer = await customerRepository.findByUserId(userId);
  return formatCustomerProfile(user, customer);
};

/**
 * Update Customer Profile details and sync Customer collection
 * @param {String} userId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateCustomerProfile = async (userId, updateData) => {
  if (!userId) {
    throw createError(401, 'Unauthorized. User ID not found.');
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw createError(404, 'User not found.');
  }

  // Update Customer profile document fields
  const cleanedUpdate = {};
  if (updateData.firstName !== undefined) cleanedUpdate.firstName = updateData.firstName;
  if (updateData.lastName !== undefined) cleanedUpdate.lastName = updateData.lastName;
  if (updateData.phone !== undefined) cleanedUpdate.phone = updateData.phone;
  if (updateData.profileImage !== undefined) cleanedUpdate.profileImage = updateData.profileImage;

  // Check and sync nested address fields
  const addressFields = ['addressStreet', 'addressCity', 'addressDistrict', 'addressState', 'addressZipCode', 'addressCountry'];
  const hasAddressUpdate = addressFields.some(field => updateData[field] !== undefined);

  if (hasAddressUpdate) {
    const currentCustomer = await customerRepository.findByUserId(userId);
    const currentAddress = currentCustomer?.address || {};
    cleanedUpdate.address = {
      street: updateData.addressStreet !== undefined ? updateData.addressStreet : currentAddress.street,
      city: updateData.addressCity !== undefined ? updateData.addressCity : currentAddress.city,
      district: updateData.addressDistrict !== undefined ? updateData.addressDistrict : currentAddress.district,
      state: updateData.addressState !== undefined ? updateData.addressState : currentAddress.state,
      pinCode: updateData.addressZipCode !== undefined ? updateData.addressZipCode : currentAddress.pinCode,
      country: updateData.addressCountry !== undefined ? updateData.addressCountry : (currentAddress.country || 'India'),
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
 * Upload and replace customer avatar in Cloudinary and DB
 * @param {String} userId 
 * @param {Object} file 
 * @returns {Promise<Object>}
 */
export const updateAvatar = async (userId, file) => {
  if (!userId) {
    throw createError(401, 'Unauthorized. User ID not found.');
  }

  if (!file) {
    throw createError(400, 'Please upload an image file.');
  }

  const imageUrl = file.path || file.secure_url;
  
  const customer = await customerRepository.findByUserId(userId);
  if (!customer) {
    throw createError(404, 'Customer profile not found.');
  }

  // Delete previous avatar from Cloudinary if it exists
  if (customer.profileImage && customer.profileImage !== 'default.jpg') {
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
 * Remove avatar from Cloudinary and DB
 * @param {String} userId 
 * @returns {Promise<Object>}
 */
export const deleteAvatar = async (userId) => {
  if (!userId) {
    throw createError(401, 'Unauthorized. User ID not found.');
  }

  const customer = await customerRepository.findByUserId(userId);
  if (!customer) {
    throw createError(404, 'Customer profile not found.');
  }

  if (customer.profileImage && customer.profileImage !== 'default.jpg') {
    const publicId = extractPublicId(customer.profileImage);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (destroyError) {
        console.error('Failed to destroy Cloudinary image:', destroyError);
      }
    }
    customer.profileImage = 'default.jpg';
    await customer.save();
  }

  return { profileImage: 'default.jpg' };
};
