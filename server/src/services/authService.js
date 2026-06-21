import jwt from 'jsonwebtoken';
import redisClient from '../config/redis.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/sendEmail.js';
import { validateSignupData, validateVendorSignupData } from '../validators/authValidator.js';
import userRepository from '../repositories/userRepository.js';
import AppError from '../utils/AppError.js';

class AuthService {
  async deleteOldTokens(prefix, userId) {
    try {
      const keys = await redisClient.keys(`${prefix}:*`);
      for (const key of keys) {
        const storedId = await redisClient.get(key);
        if (storedId === userId.toString()) {
          await redisClient.del(key);
        }
      }
    } catch (err) {
      console.error(`Error deleting old ${prefix} tokens:`, err);
    }
  }

  generateAccessToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '15m',
    });
  }

  generateRefreshToken(id) {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret123', {
      expiresIn: '7d',
    });
  }

  async registerUser(data) {
    const validation = validateSignupData(data);
    
    if (!validation.isValid) {
      throw new AppError(validation.errors[0], 400);
    }

    const { firstName, lastName, email, phone, password } = validation.sanitizedData;

    const userExists = await userRepository.findUserByEmail(email);
    if (userExists) {
      throw new AppError('Email already in use', 400);
    }

    const phoneExists = await userRepository.findCustomerProfileByPhone(phone);
    if (phoneExists) {
      throw new AppError('Phone number already in use', 400);
    }

    let user;
    try {
      user = await userRepository.createUser({
        email,
        password,
        role: 'user',
      });

      try {
        await userRepository.createCustomerProfile({
          userId: user._id,
          firstName,
          lastName,
          phone,
        });

        const verifyToken = jwt.sign(
          { id: user._id, type: 'email_verification' }, 
          process.env.JWT_SECRET || 'secret123', 
          { expiresIn: '15m' }
        );

        await this.deleteOldTokens('verify', user._id);
        await redisClient.setEx(`verify:${verifyToken}`, 900, user._id.toString());

        await sendVerificationEmail(user.email, verifyToken);

        return {
          email: user.email,
          message: 'Registration successful. Please check your email to verify your account.',
        };
      } catch (profileError) {
        // Manual rollback if profile creation fails
        await userRepository.findUserByIdWithoutPassword(user._id).then(u => u?.deleteOne());
        console.error('Profile creation failed, rolled back user:', profileError);
        throw new AppError('Invalid profile data', 400);
      }
    } catch (error) {
      console.error('User registration error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Server error during registration', 500);
    }
  }

  async registerVendor(data) {
    const validation = validateVendorSignupData(data);
    
    if (!validation.isValid) {
      throw new AppError(validation.errors[0], 400);
    }

    const { firstName, lastName, email, phone, password } = validation.sanitizedData;

    const userExists = await userRepository.findUserByEmail(email);
    if (userExists) {
      throw new AppError('Email already in use', 400);
    }

    // Optional: We can check phone against VendorProfile or a general phone check
    // Assuming checkPhoneAvailability checks CustomerProfile, we probably need a check for VendorProfile.
    // For now we just create, and if it fails due to unique constraint, we catch it.
    // Let's add a check for Vendor phone. We need a method in userRepository for this.
    // We will assume phone is checked inside the creation block or we add it to the repo later.

    let user;
    try {
      user = await userRepository.createUser({
        email,
        password,
        role: 'vendor',
      });

      try {
        await userRepository.createVendorProfile({
          userId: user._id,
          firstName,
          lastName,
          phone,
        });

        const verifyToken = jwt.sign(
          { id: user._id, type: 'email_verification' }, 
          process.env.JWT_SECRET || 'secret123', 
          { expiresIn: '15m' }
        );

        await this.deleteOldTokens('verify', user._id);
        await redisClient.setEx(`verify:${verifyToken}`, 900, user._id.toString());

        await sendVerificationEmail(user.email, verifyToken);

        return {
          email: user.email,
          message: 'Vendor registration successful. Please check your email to verify your account.',
        };
      } catch (profileError) {
        await userRepository.findUserByIdWithoutPassword(user._id).then(u => u?.deleteOne());
        console.error('Vendor profile creation failed, rolled back user:', profileError);
        throw new AppError('Invalid profile data or phone number already in use', 400);
      }
    } catch (error) {
      console.error('Vendor registration error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Server error during vendor registration', 500);
    }
  }

  async loginUser(identifier, password) {
    if (!identifier || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await userRepository.findUserByEmailWithPassword(identifier);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.authProvider === 'google') {
      throw new AppError('This account was created using Google. Please continue with Google Sign-In.', 400);
    }

    if (user.isBlocked) {
      throw new AppError('Your account has been blocked', 403);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email address before logging in.', 403);
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    user.lastLogin = Date.now();
    await userRepository.saveUser(user);

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    await redisClient.setEx(`refresh:${refreshToken}`, 7 * 24 * 60 * 60, user._id.toString());

    return {
      _id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  async getUserProfile(userId) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let profile = null;
    if (user.role === 'user') {
      profile = await userRepository.findCustomerProfileByUserId(user._id);
    } else if (user.role === 'vendor') {
      profile = await userRepository.findVendorProfileByUserId(user._id);
    }

    return {
      _id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profile,
    };
  }

  async verifyEmailToken(token) {
    if (!token) throw new AppError('Token is required', 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    } catch (err) {
      throw new AppError('Debug Error: ' + err.message, 400);
    }
    
    if (decoded.type !== 'email_verification') {
      throw new AppError('Invalid token type', 400);
    }

    const userId = decoded.id;
    const redisKey = `verify:${token}`;
    const storedUserId = await redisClient.get(redisKey);

    if (!storedUserId) {
      throw new AppError('Verification link has expired or has already been used.', 400);
    }
    
    if (storedUserId !== userId) {
      throw new AppError(`Redis: User mismatch. Expected ${userId}, got ${storedUserId}.`, 400);
    }

    const user = await userRepository.findUserById(userId);
    if (!user) {
       throw new AppError('User not found', 400);
    }

    user.isEmailVerified = true;
    await userRepository.saveUser(user);

    await redisClient.del(redisKey);

    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    await redisClient.setEx(`refresh:${refreshToken}`, 7 * 24 * 60 * 60, user._id.toString());
    
    return { 
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      message: 'Email verified successfully.' 
    };
  }

  async resendVerificationEmail(email) {
    if (!email) throw new AppError('Email is required', 400);

    const user = await userRepository.findUserByEmail(email);
    if (!user) throw new AppError('User not found', 400);
    if (user.isEmailVerified) throw new AppError('Email is already verified', 400);

    const verifyToken = jwt.sign(
      { id: user._id, type: 'email_verification' }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '15m' }
    );
    
    await this.deleteOldTokens('verify', user._id);
    await redisClient.setEx(`verify:${verifyToken}`, 900, user._id.toString());
    await sendVerificationEmail(user.email, verifyToken);
    
    return { message: 'Verification email sent' };
  }

  async requestPasswordReset(email) {
    if (!email) throw new AppError('Email is required', 400);

    const user = await userRepository.findUserByEmail(email.toLowerCase());
    
    if (!user) {
      throw new AppError('No account found with that email address.', 404);
    }

    if (user.authProvider === 'google') {
      throw new AppError('This account is authenticated via Google. Password reset is not available.', 400);
    }

    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '15m' }
    );
    
    await this.deleteOldTokens('reset', user._id);
    await redisClient.setEx(`reset:${resetToken}`, 900, user._id.toString());
    
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);
    
    if (!emailSent) {
      throw new AppError('Failed to send password reset email.', 500);
    }

    return { message: 'Password reset link sent to your email.' };
  }

  async resetUserPassword(token, password) {
    if (!token || !password) {
      throw new AppError('Token and new password are required', 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    } catch (err) {
      throw new AppError('Invalid or expired token.', 400);
    }
    
    if (decoded.type !== 'password_reset') {
      throw new AppError('Invalid token type', 400);
    }

    const userId = decoded.id;
    const redisKey = `reset:${token}`;
    const storedUserId = await redisClient.get(redisKey);

    if (!storedUserId) {
      throw new AppError('Password reset link has expired or has already been used.', 400);
    }
    
    if (storedUserId !== userId) {
      throw new AppError(`Redis: User mismatch. Expected ${userId}, got ${storedUserId}.`, 400);
    }

    const user = await userRepository.findUserById(userId, true);
    if (!user) {
       throw new AppError('User not found', 400);
    }

    const isSamePassword = await user.matchPassword(password);
    if (isSamePassword) {
      throw new AppError('Unable to update password. Please choose a different password and try again.', 400);
    }

    user.password = password;
    await userRepository.saveUser(user);

    await redisClient.del(redisKey);

    return { message: 'Password has been successfully reset.' };
  }

  async checkEmailAvailability(email) {
    if (!email) throw new AppError('Email is required', 400);
    const userExists = await userRepository.findUserByEmail(email.trim().toLowerCase());
    return { available: !userExists };
  }

  async checkPhoneAvailability(phone) {
    if (!phone) throw new AppError('Phone is required', 400);
    const formattedPhone = String(phone).replace(/[\s-]/g, '');
    const phoneExists = await userRepository.findCustomerProfileByPhone(formattedPhone);
    return { available: !phoneExists };
  }

  async handleGoogleAuth(userProfile) {
    // If it's a completely new user who came from the login page, they need to select a role.
    if (userProfile.isNewGoogleUser && userProfile.needsRoleSelection) {
      const tempToken = jwt.sign(
        { googleId: userProfile.googleId, email: userProfile.email, firstName: userProfile.firstName, lastName: userProfile.lastName, profileImage: userProfile.profileImage },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '15m' }
      );
      // We can use Redis to store it too, but JWT is stateless and sufficient here since they will just return it.
      return { needsRoleSelection: true, tempToken };
    }

    // If it's an existing user just logging in
    if (!userProfile.isNewGoogleUser) {
      if (userProfile.isBlocked) {
        throw new AppError('Your account has been blocked', 403);
      }
      userProfile.lastLogin = Date.now();
      await userRepository.saveUser(userProfile);

      const accessToken = this.generateAccessToken(userProfile._id);
      const refreshToken = this.generateRefreshToken(userProfile._id);
      await redisClient.setEx(`refresh:${refreshToken}`, 7 * 24 * 60 * 60, userProfile._id.toString());

      return {
        _id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        accessToken,
        refreshToken,
      };
    }

    // If it's a new user who came from Signup with Google (role is already selected)
    // Create the account immediately.
    return await this.createGoogleAccount(userProfile.email, userProfile.googleId, userProfile.requestedRole, userProfile.firstName, userProfile.lastName, userProfile.profileImage);
  }

  async createGoogleAccount(email, googleId, role, firstName, lastName, profileImage) {
    let user;
    try {
      user = await userRepository.createUser({
        email,
        authProvider: 'google',
        googleId,
        role,
        isEmailVerified: true, // Google emails are already verified
      });

      if (role === 'vendor') {
        await userRepository.createVendorProfile({
          userId: user._id,
          firstName,
          lastName,
          phone: '0000000000', // Placeholder, vendor will need to update
          profileImage
        });
      } else {
        await userRepository.createCustomerProfile({
          userId: user._id,
          firstName,
          lastName,
          phone: '0000000000', // Placeholder
          profileImage
        });
      }

      const accessToken = this.generateAccessToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);
      await redisClient.setEx(`refresh:${refreshToken}`, 7 * 24 * 60 * 60, user._id.toString());

      return {
        _id: user.id,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (user) await userRepository.findUserByIdWithoutPassword(user._id).then(u => u?.deleteOne());
      console.error('Google user creation failed:', error);
      throw new AppError('Failed to create account via Google.', 500);
    }
  }

  async completeGoogleSignup(tempToken, role) {
    if (!tempToken || !role) {
      throw new AppError('Token and role are required', 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret123');
    } catch (err) {
      throw new AppError('Session expired. Please try Google Sign-In again.', 400);
    }

    const { email, googleId, firstName, lastName, profileImage } = decoded;

    // Double check email availability just in case
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('An account with this email was created while you were choosing a role.', 400);
    }

    return await this.createGoogleAccount(email, googleId, role, firstName, lastName, profileImage);
  }
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401);
    }

    // Check Redis for active refresh token
    const redisKey = `refresh:${refreshToken}`;
    const storedUserId = await redisClient.get(redisKey);

    if (!storedUserId) {
      throw new AppError('Refresh token expired or invalid', 401);
    }

    // Verify token structure and expiration (even though Redis is the source of truth, it's good practice)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret123');
    } catch (error) {
      // If token is invalid/expired, remove from Redis
      await redisClient.del(redisKey);
      throw new AppError('Refresh token invalid', 401);
    }

    if (decoded.id !== storedUserId) {
      await redisClient.del(redisKey);
      throw new AppError('Token mismatch', 401);
    }

    const user = await userRepository.findUserById(storedUserId);
    if (!user || user.isBlocked) {
      await redisClient.del(redisKey);
      throw new AppError('User not found or blocked', 403);
    }

    // Token Rotation: Invalidate old token and issue new ones
    await redisClient.del(redisKey);
    
    const newAccessToken = this.generateAccessToken(user._id);
    const newRefreshToken = this.generateRefreshToken(user._id);
    
    // Store new refresh token
    await redisClient.setEx(`refresh:${newRefreshToken}`, 7 * 24 * 60 * 60, user._id.toString());

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logoutUser(refreshToken) {
    if (refreshToken) {
      await redisClient.del(`refresh:${refreshToken}`);
    }
    return { message: 'Logged out successfully' };
  }
}

export default new AuthService();
