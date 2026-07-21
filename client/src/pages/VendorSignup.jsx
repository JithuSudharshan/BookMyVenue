import React, { useContext } from 'react';
import SignupForm from '../components/auth/SignupForm';
import { authApi } from '../api/auth-api/authApi';
import { AuthContext } from '../store/AuthContext';
import { FiAlertCircle } from 'react-icons/fi';

const VendorSignup = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {user && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-3 flex items-center justify-center gap-2 text-sm z-50">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>
            You are currently logged in as <strong>{user.profile?.firstName || user.name || user.email}</strong> (Customer). 
            To register as a vendor, you must create a separate vendor account with a <strong>different email address</strong>.
          </p>
        </div>
      )}
      <SignupForm 
        title="Vendor Sign Up" 
        subtitle="Partner with BookMyVenue to list and manage your premium venues."
        buttonText="Create Vendor Account"
        apiCall={authApi.registerVendor}
        googleRole="vendor"
      />
    </div>
  );
};

export default VendorSignup;
