import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import CustomerProfile from '../models/CustomerProfile.js';
import VendorProfile from '../models/VendorProfile.js';
import redisClient from '../config/redis.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/sendEmail.js';
import { validateSignupData } from '../utils/validation.js';

const deleteOldTokens = async (prefix, userId) => {
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
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (customer)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const validation = validateSignupData(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.errors[0], errors: validation.errors });
  }

  const { firstName, lastName, email, phone, password } = validation.sanitizedData;

  // Check if user exists (Email)
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  // Check if phone exists
  const phoneExists = await CustomerProfile.findOne({ phone });
  if (phoneExists) {
    return res.status(400).json({ message: 'Phone number already in use' });
  }

  // Use a transaction if replica set is available, otherwise normal save
  // For standard local dev without replica set, transactions might fail.
  // We'll use a manual rollback approach to be safe for standalone Mongo.
  let user;
  try {
    user = await User.create({
      email,
      password,
      role: 'user',
    });

    try {
      const profile = await CustomerProfile.create({
        userId: user._id,
        firstName,
        lastName,
        phone,
      });

      // Generate Verification Token
      const verifyToken = jwt.sign(
        { id: user._id, type: 'email_verification' }, 
        process.env.JWT_SECRET || 'secret123', 
        { expiresIn: '15m' }
      );

      // Store in Redis (TTL 15 mins = 900 seconds)
      await deleteOldTokens('verify', user._id);
      await redisClient.setEx(`verify:${verifyToken}`, 900, user._id.toString());

      // Send Verification Email
      await sendVerificationEmail(user.email, verifyToken);

      res.status(201).json({
        email: user.email,
        message: 'Registration successful. Please check your email to verify your account.',
      });
    } catch (profileError) {
      // Manual rollback if profile creation fails
      await User.findByIdAndDelete(user._id);
      console.error('Profile creation failed, rolled back user:', profileError);
      return res.status(400).json({ message: 'Invalid profile data' });
    }
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { identifier, email, password } = req.body; 
  const userIdentifier = identifier || email;

  if (!userIdentifier || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check for user email
    const user = await User.findOne({ email: userIdentifier }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email address before logging in.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update lastLogin
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      _id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'user') {
      profile = await CustomerProfile.findOne({ userId: user._id });
    }
    // Add logic for vendor/admin profiles if needed later

    res.json({
      _id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profile,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Email via Token
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  
  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const userId = decoded.id;

    // Check Redis
    const redisKey = `verify:${token}`;
    const storedUserId = await redisClient.get(redisKey);

    if (!storedUserId) {
      return res.status(400).json({ message: `Verification link has expired or has already been used.` });
    }
    
    if (storedUserId !== userId) {
      return res.status(400).json({ message: `Redis: User mismatch. Expected ${userId}, got ${storedUserId}.` });
    }

    // Update user
    const user = await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });
    
    if (!user) {
       return res.status(400).json({ message: 'User not found' });
    }

    // Remove token from Redis
    await redisClient.del(redisKey);

    // Provide auth token to auto-login
    const authToken = generateToken(user._id);
    
    res.json({ 
      token: authToken, 
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      message: 'Email verified successfully.' 
    });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(400).json({ message: `Debug Error: ${err.message}` });
  }
};

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email is already verified' });

    const verifyToken = jwt.sign(
      { id: user._id, type: 'email_verification' }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '15m' }
    );
    
    await deleteOldTokens('verify', user._id);
    await redisClient.setEx(`verify:${verifyToken}`, 900, user._id.toString());
    await sendVerificationEmail(user.email, verifyToken);
    
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // User requested: "when th user enters an email id which is not already and user the verify mail shoundt be send"
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address.' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '15m' }
    );
    
    // Store in Redis
    await deleteOldTokens('reset', user._id);
    await redisClient.setEx(`reset:${resetToken}`, 900, user._id.toString());
    
    // Send email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send password reset email.' });
    }

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request.' });
  }
};

// @desc    Check if email is available
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const userExists = await User.findOne({ email: email.trim().toLowerCase() });
  res.json({ available: !userExists });
};

// @desc    Check if phone is available
// @route   POST /api/auth/check-phone
// @access  Public
export const checkPhone = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone is required' });
  const formattedPhone = String(phone).replace(/[\s-]/g, '');
  const phoneExists = await CustomerProfile.findOne({ phone: formattedPhone });
  res.json({ available: !phoneExists });
};

// @desc    Reset Password via Token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const userId = decoded.id;

    // Check Redis
    const redisKey = `reset:${token}`;
    const storedUserId = await redisClient.get(redisKey);

    if (!storedUserId) {
      return res.status(400).json({ message: `Password reset link has expired or has already been used.` });
    }
    
    if (storedUserId !== userId) {
      return res.status(400).json({ message: `Redis: User mismatch. Expected ${userId}, got ${storedUserId}.` });
    }

    // Find the user (include password to check against the new one)
    const user = await User.findById(userId).select('+password');
    if (!user) {
       return res.status(400).json({ message: 'User not found' });
    }

    // Check if new password is the same as the current password
    const isSamePassword = await user.matchPassword(password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: 'Unable to update password. Please choose a different password and try again.' 
      });
    }

    // Update password
    user.password = password;
    await user.save(); // This will trigger the pre-save hook to hash the new password

    // Remove token from Redis
    await redisClient.del(redisKey);

    res.json({ message: 'Password has been successfully reset.' });
  } catch (err) {
    console.error('Password reset error:', err);
    return res.status(400).json({ message: `Invalid or expired token.` });
  }
};

