import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { Building2, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const VendorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeVendor');
    if (!hasSeenWelcome) {
      toast.success('Welcome to the Vendor Portal! You have successfully authenticated.');
      sessionStorage.setItem('hasSeenWelcomeVendor', 'true');
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2 text-primary">
          <Building2 className="w-8 h-8" />
          <span className="font-headline-sm text-headline-sm tracking-tight font-bold">Vendor Portal</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            {user?.profile?.profileImage && user.profile.profileImage !== 'default.jpg' ? (
              <img src={user.profile.profileImage} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-outline-variant shadow-sm" />
            ) : (
              <div className="w-9 h-9 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container font-label-md font-bold shadow-sm">
                {user?.profile?.firstName?.charAt(0)?.toUpperCase() || 'V'}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md text-on-surface leading-tight">
                {user?.profile?.firstName || 'Vendor'}
              </span>
              <span className="font-body-sm text-on-surface-variant text-xs">
                {user?.email}
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-outline-variant hidden md:block"></div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-container-max mx-auto p-margin-desktop mt-8">
        <div className="bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Vendor Dashboard</h1>
          <p className="font-body-lg text-on-surface-variant">Manage your venues, bookings, and business profile here.</p>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
