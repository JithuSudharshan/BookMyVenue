import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import { authApi } from '../api/auth-api/authApi';

const CustomerSignup = () => {
  return (
    <SignupForm 
      title="Customer Sign Up" 
      subtitle="Join BookMyVenue to find and book premium event spaces."
      buttonText="Create Account"
      apiCall={authApi.register}
    />
  );
};

export default CustomerSignup;
