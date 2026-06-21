import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext';
import { Building2, LogOut, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { vendorApi } from '../api/vendor-api/vendorApi';

const VendorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeVendor');
    if (!hasSeenWelcome) {
      toast.success('Welcome to the Vendor Portal! You have successfully authenticated.');
      sessionStorage.setItem('hasSeenWelcomeVendor', 'true');
    }
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await vendorApi.getOnboardingStatus();
      setStatusData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const renderBanner = () => {
    if (loading || !statusData) return null;
    const { onboardingStatus, adminRemarks } = statusData;

    if (onboardingStatus === 'incomplete') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3 mb-3 sm:mb-0">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="font-label-lg font-bold text-amber-900">Your profile is incomplete</h3>
              <p className="text-amber-700 text-sm">Complete your profile to start listing venues.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/vendor/onboarding')}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-label-md shadow-sm whitespace-nowrap"
          >
            Complete Profile
          </button>
        </div>
      );
    }

    if (onboardingStatus === 'under_review') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center space-x-3 shadow-sm">
          <Info className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="font-label-lg font-bold text-blue-900">Profile Under Review</h3>
            <p className="text-blue-700 text-sm">Our team is verifying your details. We'll notify you once approved.</p>
          </div>
        </div>
      );
    }

    if (onboardingStatus === 'changes_requested') {
      return (
        <div className="bg-error-container border border-error rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm">
          <div className="flex items-start space-x-3 mb-3 sm:mb-0">
            <AlertCircle className="w-6 h-6 text-error" />
            <div>
              <h3 className="font-label-lg font-bold text-on-error-container">Changes Requested</h3>
              <p className="text-error text-sm">{adminRemarks || 'Please update your profile information as requested by the admin.'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/vendor/onboarding')}
            className="px-4 py-2 bg-error text-on-error rounded-lg hover:bg-error/90 transition font-label-md shadow-sm whitespace-nowrap"
          >
            Update Profile
          </button>
        </div>
      );
    }

    if (onboardingStatus === 'rejected') {
      return (
        <div className="bg-surface-container-highest border border-outline rounded-xl p-4 mb-6 flex items-center space-x-3 shadow-sm">
          <AlertCircle className="w-6 h-6 text-on-surface" />
          <div>
            <h3 className="font-label-lg font-bold text-on-surface">Application Rejected</h3>
            <p className="text-on-surface-variant text-sm">Unfortunately, your application was not approved. {adminRemarks}</p>
          </div>
        </div>
      );
    }

    return null;
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
        {renderBanner()}
        
        <div className="bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm relative overflow-hidden">
          {(!statusData || statusData.onboardingStatus !== 'approved') && (
            <div className="absolute inset-0 bg-surface/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              {statusData?.onboardingStatus === 'approved' ? null : (
                 <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-lg max-w-sm text-center">
                    <Building2 className="w-12 h-12 text-outline-variant mx-auto mb-4" />
                    <h3 className="font-title-lg mb-2">Dashboard Locked</h3>
                    <p className="text-on-surface-variant text-sm">Features will unlock once your vendor profile is approved.</p>
                 </div>
              )}
            </div>
          )}
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Vendor Dashboard</h1>
          <p className="font-body-lg text-on-surface-variant">Manage your venues, bookings, and business profile here.</p>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
