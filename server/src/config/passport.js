import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const state = req.query.state || ''; // e.g. 'role=vendor'

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
          if (user.authProvider === 'local') {
            // Found local account with same email
            return done(null, false, {
              message: 'An account already exists with this email. Please login using your password to connect Google.',
            });
          }
          // Existing Google user -> Log them in
          return done(null, user);
        }

        // New Google User
        // If state specifies a role (they clicked "Signup with Google" from Customer or Vendor signup pages)
        if (state === 'user' || state === 'vendor') {
          const role = state;
          
          // We don't create them here, we will create them in the callback route 
          // to easily use authService and repositories, OR we create them here.
          // Since we need to create CustomerProfile or VendorProfile, we can return a temporary object
          // and let the callback route handle the DB creation.
          return done(null, { 
            isNewGoogleUser: true, 
            email, 
            googleId: profile.id, 
            firstName: profile.name?.givenName || 'Google User', 
            lastName: profile.name?.familyName || '',
            profileImage: profile.photos?.[0]?.value || null,
            requestedRole: role
          });
        }

        // If they came from Login but don't exist -> need role selection
        return done(null, {
            isNewGoogleUser: true,
            needsRoleSelection: true,
            email, 
            googleId: profile.id, 
            firstName: profile.name?.givenName || 'Google User', 
            lastName: profile.name?.familyName || '',
            profileImage: profile.photos?.[0]?.value || null
        });

      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;
