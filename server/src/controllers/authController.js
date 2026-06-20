import * as authService from '../services/authService.js';

// @desc    Check if email is available
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await authService.checkEmail(email);
    res.json(result);
  } catch (error) {
    const status = error.status || 400;
    const message = error.message || 'Server error';
    res.status(status).json({ message });
  }
};

// @desc    Check if phone is available
// @route   POST /api/auth/check-phone
// @access  Public
export const checkPhone = async (req, res) => {
  const { phone } = req.body;
  try {
    const result = await authService.checkPhone(phone);
    res.json(result);
  } catch (error) {
    const status = error.status || 400;
    const message = error.message || 'Server error';
    res.status(status).json({ message });
  }
};

// @desc    Register a new user (customer)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Server error during registration';
    const response = { message };
    if (error.errors) response.errors = error.errors;
    res.status(status).json(response);
  }
};

// @desc    Verify Email via Token
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (error) {
    const status = error.status || 400;
    const message = error.message || 'Verification error';
    res.status(status).json({ message });
  }
};

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await authService.resendVerification(email);
    res.json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Server error';
    res.status(status).json({ message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  console.log("Login Controller reached");
  const { email, password } = req.body;
  console.log(req.body);
  console.log(email, password);

  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Server error during login';
    res.status(status).json({ message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const result = await authService.getMe(req.user.id);
    res.json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Server error';
    res.status(status).json({ message });
  }
};
