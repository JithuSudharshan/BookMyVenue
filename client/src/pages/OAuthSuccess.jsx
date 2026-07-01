import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { Loader2 } from 'lucide-react';

const OAuthSuccess = () => {
  const { login, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Calling login() fetches the /me endpoint. 
    // Since we just got redirected here, the browser has the HttpOnly cookie.
    login();
  }, [login]);

  useEffect(() => {
    // Wait until loading finishes and user is populated
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-display-sm text-on-background font-semibold">Authenticating...</h2>
        <p className="text-on-surface-variant font-body-md mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
