import * as userRepository from '../repositories/userRepository.js';
import CustomerProfile from '../models/CustomerProfile.js';

// Resolve active user profile, auto-seeding if collection is empty
export const getOrSeedUser = async (userId) => {
  if (userId) {
    const user = await userRepository.findById(userId);
    if (user) return user;
  }

  // Fallback check
  let user = await userRepository.findOne({});
  if (!user) {
    user = await userRepository.create({
      firstName: 'Aarav',
      lastName: 'Sharma',
      email: 'aarav.sharma@example.com',
      password: 'mockpassword123',
      phone: '9876543210',
      addressStreet: 'X/241, Marine Drive',
      addressCity: 'Kochi',
      addressDistrict: 'Ernakulam',
      addressState: 'Kerala',
      addressZipCode: '682001',
      addressCountry: 'India'
    });
  } else {
    // Migrate existing seed user if they still have the old province/zip details or non-conforming formats
    let modified = false;
    if (user.addressState !== 'Kerala') {
      user.addressState = 'Kerala';
      modified = true;
    }
    if (user.addressZipCode === '122002' || !/^\d{6}$/.test(user.addressZipCode)) {
      user.addressZipCode = '682001';
      modified = true;
    }
    if (user.phone === '+91 98765 43210' || !/^[6-9]\d{9}$/.test(user.phone)) {
      user.phone = '9876543210';
      modified = true;
    }
    if (!user.addressDistrict) {
      user.addressDistrict = 'Ernakulam';
      modified = true;
    }
    if (modified) {
      await user.save();
    }
  }
  return user;
};

export const getUserProfile = async (userId) => {
  const user = await getOrSeedUser(userId);
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const updateUserProfile = async (userId, updateData) => {
  const user = await getOrSeedUser(userId);

  // Apply updates
  user.firstName = updateData.firstName || user.firstName;
  user.lastName = updateData.lastName || user.lastName;
  
  if (updateData.phone !== undefined) user.phone = updateData.phone;
  if (updateData.profileImage !== undefined) user.profileImage = updateData.profileImage;
  if (updateData.addressStreet !== undefined) user.addressStreet = updateData.addressStreet;
  if (updateData.addressCity !== undefined) user.addressCity = updateData.addressCity;
  if (updateData.addressDistrict !== undefined) user.addressDistrict = updateData.addressDistrict;
  if (updateData.addressState !== undefined) user.addressState = updateData.addressState;
  if (updateData.addressZipCode !== undefined) user.addressZipCode = updateData.addressZipCode;
  if (updateData.addressCountry !== undefined) user.addressCountry = updateData.addressCountry;

  await user.save();

  // Keep CustomerProfile in sync
  try {
    await CustomerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profileImage: user.profileImage,
          address: {
            street: user.addressStreet,
            city: user.addressCity,
            state: user.addressState,
            zipCode: user.addressZipCode,
            country: user.addressCountry,
          },
        },
      },
      { upsert: false }
    );
  } catch (err) {
    console.error('Failed to sync CustomerProfile:', err);
  }
  
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};
