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
    
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Set the refreshToken inside an HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove tokens from response body before sending
    const { accessToken, refreshToken, ...userData } = result;
    
    res.json(userData);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(error.statusCode || 500).json({ 
      message: error.message, 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// @desc    Logout a user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await authService.logoutUser(refreshToken);

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh'
  });

  res.json({ message: 'Logged out successfully' });
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    const result = await authService.refreshAccessToken(token);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Tokens refreshed' });
  } catch (error) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.status(error.statusCode || 401).json({ message: error.message });
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

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // Set the refreshToken inside an HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove tokens from response body before sending
    const { accessToken, refreshToken, ...userData } = result;

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

// @desc    Authenticate a user
// @route   POST /api/auth/login
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
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000
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

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { accessToken, refreshToken, ...userData } = result;
    res.json(userData);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

