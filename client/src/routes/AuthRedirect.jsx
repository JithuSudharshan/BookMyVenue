import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in, go to login (or public homepage)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated users go to their respective dashboards/home
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
};

export default AuthRedirect;
