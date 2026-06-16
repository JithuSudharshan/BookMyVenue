import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { Building2, LogOut } from 'lucide-react';

const VendorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-margin-desktop py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-primary">
          <Building2 className="w-8 h-8" />
          <span className="font-headline-sm text-headline-sm font-bold">Vendor Portal</span>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-error">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
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
