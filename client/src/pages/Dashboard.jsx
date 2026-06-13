import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { Building2, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show toast if they just logged in (we could check state, but for now we'll just show it once)
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      toast.success('Welcome to homepage! You have successfully authenticated.');
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      {/* Navigation Bar */}
      <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-primary">
          <Building2 className="w-8 h-8" />
          <span className="font-headline-sm text-headline-sm tracking-tight font-bold">BookMyVenue</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline font-body-sm text-on-surface-variant">
            {user?.email}
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-container-max mx-auto p-margin-mobile md:p-margin-desktop mt-8 relative">
        
        {/* Dashboard Content */}
        <div className="bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm mt-16 md:mt-0">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
            Welcome, {user?.profile?.firstName || 'User'}!
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
            This is your authenticated homepage. From here you will be able to manage your bookings, explore venues, and update your profile.
          </p>
          
          {/* Quick Stats or Placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Upcoming Bookings</h3>
              <p className="font-headline-md text-headline-md text-on-surface">0</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Saved Venues</h3>
              <p className="font-headline-md text-headline-md text-on-surface">0</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Account Status</h3>
              <p className="font-headline-md text-headline-md text-success flex items-center mt-1">
                <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                Active
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
