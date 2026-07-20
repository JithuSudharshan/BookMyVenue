import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { LogOut, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      toast.success('Welcome! You have successfully authenticated.');
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isVendor = user?.role === 'vendor';
  const roleName = isVendor ? 'Vendor' : 'Customer';
  const profileRoute = isVendor ? '/vendor/dashboard' : '/customer/profile';
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest p-4">
      <div className="bg-surface p-10 rounded-[32px] shadow-sm border border-outline-variant max-w-md w-full text-center">
        <div className="flex justify-center mb-6 text-primary">
          {isVendor ? <Building2 size={48} /> : <User size={48} />}
        </div>
        
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Hello, {user?.profile?.firstName || roleName}!
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
          Welcome to your BookMyVenue {roleName} portal.
        </p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate(profileRoute)}
            className="flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 rounded-2xl font-label-lg font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            {isVendor ? <Building2 size={20} /> : <User size={20} />}
            Go to My {isVendor ? 'Dashboard' : 'Profile'}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 bg-error-container text-error py-4 px-6 rounded-2xl font-label-lg font-bold hover:bg-error/20 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
