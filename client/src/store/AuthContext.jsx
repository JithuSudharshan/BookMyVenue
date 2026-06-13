import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth-api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res);
    } catch (error) {
      // If 401, user is just not logged in (no valid cookie)
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, []);

  const login = () => {
    setLoading(true);
    fetchUser(); // This will fetch the user since the cookie is now set
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
