import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import { authApi } from '../api/auth-api/authApi';

const VendorSignup = () => {
  return (
    <SignupForm 
      title="Vendor Sign Up" 
      subtitle="Partner with BookMyVenue to list and manage your premium venues."
      buttonText="Create Vendor Account"
      apiCall={authApi.registerVendor}
    />
  );
};

export default VendorSignup;
