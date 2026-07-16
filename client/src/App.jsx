import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AuthRedirect from './routes/AuthRedirect';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import SignupSelection from './pages/SignupSelection';
import CustomerSignup from './pages/Signup';
import PendingVerification from './pages/PendingVerification';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorApplicationStatus from './pages/vendor/VendorApplicationStatus';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/customer/ProfilePage';
import BookingsPage from './pages/customer/BookingsPage';
import WishlistPage from './pages/customer/WishlistPage';
import WalletPage from './pages/common/WalletPage';
import VendorSignup from './pages/VendorSignup';
import VendorProfilePage from './pages/vendor/VendorProfilePage';
import OAuthSuccess from './pages/OAuthSuccess';
import VendorOnboarding from './pages/vendor-onboarding/VendorOnboarding';
import MyVenuesPage from './pages/vendor/MyVenuesPage';
import VenueDetailPage from './pages/venues/VenueDetailPage';
import VendorBookingsPage from './pages/vendor/VendorBookingsPage';
import { Toaster } from 'sonner';

const Unauthorized = () => <div className="p-8 text-error">You are not authorized to view this page.</div>;

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
      <Router>
        <Routes>
          {/* Root Redirect (Role-Based) */}
          <Route path="/" element={<AuthRedirect />} />

          {/* Public Routes (Only accessible if NOT logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupSelection />} />
            <Route path="/customer-signup" element={<CustomerSignup />} />
            <Route path="/vendor-signup" element={<VendorSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Auth Utility Routes - Protected from authenticated users going back */}
            <Route path="/verify-email/pending" element={<PendingVerification />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
          </Route>

          {/* Shared Post-Login Dummy Homepage */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']} />}>
            <Route path="/home" element={<HomePage />} />
          </Route>

          {/* Protected Routes for Customers */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            {/* Customer Dashboard — with sidebar layout */}
            <Route element={<DashboardLayout />}>
              <Route path="/customer/profile" element={<ProfilePage />} />
              <Route path="/customer/bookings" element={<BookingsPage />} />
              <Route path="/customer/wishlist" element={<WishlistPage />} />
              <Route path="/customer/wallet" element={<WalletPage />} />
            </Route>
          </Route>

          {/* Protected Routes for Vendors */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/vendor/application-status" element={<VendorApplicationStatus />} />
              <Route path="/vendor/profile" element={<VendorProfilePage />} />
              <Route path="/vendor/venues" element={<MyVenuesPage />} />
              <Route path="/vendor/venues/:id" element={<VenueDetailPage />} />
              <Route path="/vendor/bookings" element={<VendorBookingsPage />} />
              <Route path="/vendor/wallet" element={<WalletPage />} />
            </Route>
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
          </Route>

          {/* Public/Shared Venue Routes */}
          {/* /venues/:id removed — vendor venue detail is now at /vendor/venues/:id */}
          
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Fallback Catch-all Route (Redirects back to AuthRedirect) */}
          <Route path="*" element={<AuthRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
