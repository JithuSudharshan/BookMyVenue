import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

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
import Dashboard from './pages/Dashboard';
import VendorSignup from './pages/VendorSignup';
import OAuthSuccess from './pages/OAuthSuccess';

import VendorDashboard from './pages/VendorDashboard';
import VendorOnboarding from './pages/vendor-onboarding/VendorOnboarding';

import { Toaster } from 'sonner';

const Unauthorized = () => <div className="p-8 text-error">You are not authorized to view this page.</div>;

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          classNames: {
            toast: 'bg-white border border-gray-200 shadow-md rounded-xl font-medium',
            title: 'text-inherit font-semibold',
            success: '!text-green-600 !bg-white !border-green-200',
            error: '!text-red-600 !bg-white !border-red-200',
          }
        }}
      />
      <div className="font-sans antialiased text-dark bg-background min-h-screen">
        <Routes>
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

          {/* Protected Routes for Customers */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/home" element={<Dashboard />} />
          </Route>

          {/* Protected Routes for Vendors */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            
            {/* Vendor Sub-router for Venue Management */}
            <Route path="/vendor/*" element={<VendorRoutes />} />
          </Route>

          {/* Protected Routes for Admins */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            {/* Admin Sub-router */}
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Route>
          
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Public Discovery / User Routes */}
          <Route path="/*" element={<UserRoutes />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
