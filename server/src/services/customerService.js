import cloudinary from '../config/cloudinary.js';
import userRepository from '../repositories/userRepository.js';
import * as customerRepository from '../repositories/customerRepository.js';
import Booking from '../models/bookingModel.js';
import Review from '../models/reviewModel.js';
import '../models/venueModel.js'; // Register Venue schema for populate
import Vendor from '../models/vendorModel.js';
import { toCustomerBookingDTO } from '../dto/booking/CustomerBookingDTO.js';
import * as wishlistRepository from '../repositories/wishlistRepository.js';
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
    status: user.isBlocked ? 'Blocked' : 'Active',
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

/**
 * Fetch paginated bookings for a customer.
 * @param {string} userId - The unique identifier of the user
 * @param {number} page - Page number
 * @param {number} limit - Number of records per page
 * @returns {Promise<Object>} - Paginated bookings
 */
export const getBookings = async (userId, page = 1, limit = 10, filter = 'All', search = '', bookingMode = '') => {
  if (!userId) {
    throw new AppError('Unauthorized. User ID not found.', 401);
  }

  const query = { userId };
  const filterLower = filter.toLowerCase();
  
  if (filterLower === 'upcoming') {
    query.bookingStatus = { $in: ['pending', 'confirmed'] };
  } else if (filterLower === 'completed') {
    query.bookingStatus = 'completed';
  } else if (filterLower === 'cancelled') {
    query.bookingStatus = 'cancelled';
  } else if (filterLower === 'today') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    query.$or = [
      { date: { $gte: startOfDay, $lte: endOfDay } },
      { startDate: { $gte: startOfDay, $lte: endOfDay } }
    ];
  }
  
  if (search) {
    query.bookingNumber = { $regex: search, $options: 'i' };
  }
  
  if (bookingMode) {
    query.bookingMode = bookingMode;
  }

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(query)
    .populate('venueId', 'name location images pricing capacity description rules checkInTime checkOutTime')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Fetch all unique vendor profiles for these bookings
  const vendorUserIds = [...new Set(bookings.map(b => b.vendorId?._id || b.vendorId).filter(Boolean))];
  const vendors = await Vendor.find({ userId: { $in: vendorUserIds } }).lean();

  // Build a lookup map: userId -> vendorProfile
  const vendorMap = vendors.reduce((acc, vendor) => {
    acc[vendor.userId.toString()] = vendor;
    return acc;
  }, {});

  // Fetch reviews for bookings
  const bookingIds = bookings.map((b) => b._id);
  const reviews = await Review.find({ bookingId: { $in: bookingIds } }).lean();
  const reviewMap = {};
  reviews.forEach((r) => {
    reviewMap[r.bookingId.toString()] = r;
  });

  // Apply DTO and attach review
  const dtoList = bookings.map(booking => {
    const vendorUserIdStr = booking.vendorId?._id?.toString() || booking.vendorId?.toString();
    const vendorProfile = vendorMap[vendorUserIdStr];
    const dto = toCustomerBookingDTO(booking, vendorProfile);
    dto.review = reviewMap[booking._id.toString()] || null;
    return dto;
  });

  const total = await Booking.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return {
    bookings: dtoList,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

// ─── Wishlist Services ────────────────────────────────────────────────────────

/**
 * Fetch all wishlist entries for a user (venue details populated).
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getWishlist = async (userId, page = 1, limit = 20) => {
  if (!userId) throw new AppError('Unauthorized. User ID not found.', 401);
  const skip = (page - 1) * limit;
  const wishlist = await wishlistRepository.findByUserId(userId, skip, limit);
  const total = await wishlistRepository.countByUserId(userId);
  const totalPages = Math.ceil(total / limit);

  return {
    wishlist,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Add a venue to the customer's wishlist.
 * @param {string} userId
 * @param {string} venueId
 * @returns {Promise<Object>}
 */
export const addToWishlist = async (userId, venueId) => {
  if (!userId) throw new AppError('Unauthorized. User ID not found.', 401);
  if (!venueId) throw new AppError('Venue ID is required.', 400);

  const existing = await wishlistRepository.findOne(userId, venueId);
  if (existing) throw new AppError('Venue already in wishlist.', 409);

  return await wishlistRepository.create(userId, venueId);
};

/**
 * Remove a venue from the customer's wishlist.
 * @param {string} userId
 * @param {string} venueId
 * @returns {Promise<Object>}
 */
export const removeFromWishlist = async (userId, venueId) => {
  if (!userId) throw new AppError('Unauthorized. User ID not found.', 401);
  if (!venueId) throw new AppError('Venue ID is required.', 400);

  const deleted = await wishlistRepository.deleteOne(userId, venueId);
  if (!deleted) throw new AppError('Wishlist entry not found.', 404);

  return { message: 'Removed from wishlist.' };
};
