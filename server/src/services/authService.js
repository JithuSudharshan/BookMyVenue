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

  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '30d',
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

    return {
      _id: user.id,
      email: user.email,
      role: user.role,
      token: this.generateToken(user._id),
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

    const authToken = this.generateToken(user._id);
    
    return { 
      token: authToken, 
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
}

export default new AuthService();
