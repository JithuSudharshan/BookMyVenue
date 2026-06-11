import authService from '../services/authService.js';

// @desc    Register a new user (customer)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message, errors: error.errors });
  }
};

// @desc    Register a new vendor
// @route   POST /api/auth/register-vendor
// @access  Public
export const registerVendor = async (req, res) => {
  try {
    const result = await authService.registerVendor(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message, errors: error.errors });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, email, password } = req.body; 
    const result = await authService.loginUser(identifier || email, password);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const result = await authService.getUserProfile(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Verify Email via Token
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const result = await authService.verifyEmailToken(req.params.token);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const result = await authService.resendVerificationEmail(req.body.email);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Check if email is available
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req, res) => {
  try {
    const result = await authService.checkEmailAvailability(req.body.email);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Check if phone is available
// @route   POST /api/auth/check-phone
// @access  Public
export const checkPhone = async (req, res) => {
  try {
    const result = await authService.checkPhoneAvailability(req.body.phone);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Reset Password via Token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetUserPassword(req.params.token, req.body.password);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
