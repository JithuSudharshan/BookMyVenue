import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

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
          className: 'bg-surface-container-low text-on-surface font-body-md border border-outline-variant shadow-md rounded-xl',
          classNames: {
            success: 'bg-success/10 text-success border-success/20',
            error: 'bg-error-container text-on-error-container border-error/20',
          }
        }}
      />
      <Router>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

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
          </Route>
          
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
