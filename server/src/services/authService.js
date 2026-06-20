import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';
import * as customerRepository from '../repositories/customerRepository.js';
import redisClient from '../config/redis.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
import { validateSignupData } from '../validators/authValidator.js';

// Helper to generate session JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

export const checkEmail = async (email) => {
  if (!email) throw { status: 400, message: 'Email is required' };
  const userExists = await userRepository.findOne({ email: email.trim().toLowerCase() });
  return { available: !userExists };
};

export const checkPhone = async (phone) => {
  if (!phone) throw { status: 400, message: 'Phone is required' };
  const formattedPhone = String(phone).replace(/[\s-]/g, '');
  const phoneExists = await customerRepository.findByPhone(formattedPhone);
  return { available: !phoneExists };
};

export const register = async (userData) => {
  const validation = validateSignupData(userData);
  
  if (!validation.isValid) {
    throw { status: 400, message: validation.errors[0], errors: validation.errors };
  }

  const { firstName, lastName, email, phone, password } = validation.sanitizedData;

  // Check if user exists (Email)
  const userExists = await userRepository.findOne({ email });
  if (userExists) {
    throw { status: 400, message: 'Email already in use' };
  }

  // Check if phone exists
  const phoneExists = await customerRepository.findByPhone(phone);
  if (phoneExists) {
    throw { status: 400, message: 'Phone number already in use' };
  }

  // Create User
  const user = await userRepository.create({
    email,
    password,
    role: 'customer',
  });

  try {
    // Create Profile
    await customerRepository.create({
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
    await redisClient.setEx(`verify:${verifyToken}`, 900, user._id.toString());

    // Send Verification Email
    await sendVerificationEmail(user.email, verifyToken);

    return {
      email: user.email,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  } catch (profileError) {
    // Manual rollback if profile creation fails
    await userRepository.deleteById(user._id);
    console.error('Profile creation failed, rolled back user:', profileError);
    throw { status: 400, message: 'Invalid profile data' };
  }
};

export const verifyEmail = async (token) => {
  if (!token) throw { status: 400, message: 'Token is required' };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    
    if (decoded.type !== 'email_verification') {
      throw { status: 400, message: 'Invalid token type' };
    }

    const userId = decoded.id;

    // Check Redis
    const redisKey = `verify:${token}`;
    const storedUserId = await redisClient.get(redisKey);

    if (!storedUserId) {
      throw { status: 400, message: 'Verification link has expired or has already been used.' };
    }
    
    if (storedUserId !== userId) {
      throw { status: 400, message: `Redis: User mismatch. Expected ${userId}, got ${storedUserId}.` };
    }

    // Update user
    const user = await userRepository.update(userId, { isEmailVerified: true });
    
    if (!user) {
       throw { status: 400, message: 'User not found' };
    }

    // Remove token from Redis
    await redisClient.del(redisKey);

    // Provide auth token to auto-login
    const authToken = generateToken(user._id);
    
    return { 
      token: authToken, 
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      message: 'Email verified successfully.' 
    };
  } catch (err) {
    console.error('Verification error:', err);
    if (err.status) throw err;
    throw { status: 400, message: `Debug Error: ${err.message}` };
  }
};

export const resendVerification = async (email) => {
  if (!email) throw { status: 400, message: 'Email is required' };

  const user = await userRepository.findOne({ email });
  if (!user) throw { status: 400, message: 'User not found' };
  if (user.isEmailVerified) throw { status: 400, message: 'Email is already verified' };

  const verifyToken = jwt.sign(
    { id: user._id, type: 'email_verification' }, 
    process.env.JWT_SECRET || 'secret123', 
    { expiresIn: '15m' }
  );
  
  await redisClient.setEx(`verify:${verifyToken}`, 900, user._id.toString());
  await sendVerificationEmail(user.email, verifyToken);
  
  return { message: 'Verification email sent' };
};

export const login = async (email, password) => {
  if (!email || !password) {
    throw { status: 400, message: 'Please provide email and password' };
  }

  // Check for user email
  const user = await userRepository.findOneWithPassword({ email });

  if (!user) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  if (!user.isEmailVerified) {
    throw { status: 403, message: 'Please verify your email address before logging in.' };
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  // Update lastLogin
  user.lastLogin = Date.now();
  await user.save();

  return {
    _id: user.id,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};

export const getMe = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  let profile = null;
  if (user.role === 'customer') {
    profile = await customerRepository.findByUserId(user._id);
  }

  return {
    _id: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    profile,
  };
};
