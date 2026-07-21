import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';

const PublicRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (user) {
    return <Navigate to="/auth-redirect" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
