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
    
    // Set the token inside an HttpOnly cookie
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Remove token from response body before sending
    const { token, ...userData } = result;
    
    res.json(userData);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Logout a user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
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

    // Set the token inside an HttpOnly cookie
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Remove token from response body before sending
    const { token, ...userData } = result;

    res.json(userData);
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

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = async (req, res) => {
  try {
    const result = await authService.handleGoogleAuth(req.user);

    if (result.needsRoleSelection) {
      // Redirect to frontend role selection page with the temp token
      return res.redirect(`http://localhost:5173/signup?google_token=${result.tempToken}`);
    }

    // Login successful
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.redirect(`http://localhost:5173/oauth-success`);
  } catch (error) {
    res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
  }
};

// @desc    Complete Google Signup after role selection
// @route   POST /api/auth/google/complete-signup
// @access  Public
export const completeGoogleSignup = async (req, res) => {
  try {
    const { token, role } = req.body;
    const result = await authService.completeGoogleSignup(token, role);

    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    const { token: _, ...userData } = result;
    res.json(userData);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
