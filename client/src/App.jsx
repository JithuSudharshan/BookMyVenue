import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AuthRedirect from './routes/AuthRedirect';

import DashboardLayout from './layouts/DashboardLayout';

import UserRoutes from './routes/UserRoutes';
import VendorRoutes from './routes/VendorRoutes';
import AdminRoutes from './routes/AdminRoutes';

// Pages
import Login from './pages/Login';
import SignupSelection from './pages/SignupSelection';
import CustomerSignup from './pages/Signup';
import PendingVerification from './pages/PendingVerification';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/customer/ProfilePage';
import BookingsPage from './pages/customer/BookingsPage';
import WishlistPage from './pages/customer/WishlistPage';
import WalletPage from './pages/common/WalletPage';
import NotFound from './pages/common/NotFound';
import OAuthSuccess from './pages/OAuthSuccess';
import VendorSignup from './pages/VendorSignup';
import VendorOnboarding from './pages/vendor-onboarding/VendorOnboarding';
import { Toaster } from 'sonner';
import { ROLES } from './utils/roles';
import Unauthorized from './pages/common/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-surface-container-lowest text-on-surface font-body-md shadow-lg rounded-xl border border-outline-variant/30',
          classNames: {
            success: 'border-l-4 border-l-success !pl-4',
            error: 'border-l-4 border-l-primary !pl-4',
          }
        }}
      />
      <Routes>
          {/* Dedicated Auth Redirect */}
          <Route path="/auth-redirect" element={<AuthRedirect />} />

          {/* Public Routes (Only accessible if NOT logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupSelection />} />
            <Route path="/customer-signup" element={<CustomerSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Auth Utility Routes - Protected from authenticated users going back */}
            <Route path="/verify-email/pending" element={<PendingVerification />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
          </Route>

          {/* Semi-Public Routes (Accessible by logged-in customers who want to become vendors) */}
          <Route path="/vendor-signup" element={<VendorSignup />} />
          {/* Protected Routes for Customers */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
            {/* Customer Dashboard — with sidebar layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/customer/profile" element={<ProfilePage />} />
              <Route path="/customer/bookings" element={<BookingsPage />} />
              <Route path="/customer/wishlist" element={<WishlistPage />} />
              <Route path="/customer/wallet" element={<WalletPage />} />
            </Route>
          </Route>

          {/* Protected Routes for Vendors */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.VENDOR]} />}>
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            <Route element={<DashboardLayout />}>
              {/* Vendor Sub-router handles dashboard, venues, bookings, profile, etc. */}
              <Route path="/vendor/*" element={<VendorRoutes />} />
            </Route>
          </Route>

          {/* Admin Routes (handles its own protection internally) */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Public/Shared Venue Routes */}
          {/* /venues/:id removed — vendor venue detail is now at /vendor/venues/:id */}
          
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Public Discovery / User Routes (Includes Landing Page) */}
          <Route path="/*" element={<UserRoutes />} />
          
          {/* Fallback Catch-all Route (Redirects to 404 Page) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </AuthProvider>
  );
}

export default App;
