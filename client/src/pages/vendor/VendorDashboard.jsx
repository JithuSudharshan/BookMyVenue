import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApi } from '../../api/vendor-api/vendorApi';
import { toast } from 'sonner';
import { AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await vendorApi.getOnboardingStatus();
        setStatusData(res);
        
        if (res.onboardingStatus === 'approved') {
          const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeVendor');
          if (!hasSeenWelcome) {
            toast.success('Welcome to the Vendor Portal! You have successfully authenticated.');
            sessionStorage.setItem('hasSeenWelcomeVendor', 'true');
          }
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-outline-variant/30"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // APPROVED STATE (Actual Dashboard)
  return (
    <div className="w-full">
      <main className="max-w-container-max mx-auto mt-4 px-4 md:px-8">
        <div className="bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm relative overflow-hidden min-h-[500px]">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Vendor Dashboard</h1>
              <p className="font-body-lg text-on-surface-variant">Manage your venues, bookings, and business profile here.</p>
            </div>
            <button
              onClick={() => navigate('/vendor/venues/add')}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Venue
            </button>
          </div>
          
          {/* Mock Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-on-surface-variant mb-1">Total Venues</h3>
              <p className="font-headline-md text-on-surface">0</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-on-surface-variant mb-1">Active Bookings</h3>
              <p className="font-headline-md text-on-surface">0</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-on-surface-variant mb-1">Wallet Balance</h3>
              <p className="font-headline-md text-on-surface">₹0</p>
            </div>
          </div>

          <div className="h-64 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col items-center justify-center p-6 text-center">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
             </div>
             <h3 className="font-headline-sm text-on-surface mb-2">You're Approved!</h3>
             <p className="text-on-surface-variant font-body-md mb-6 max-w-md">
               Your vendor account is fully active. The next step is to create your first venue listing to start receiving bookings.
             </p>
             <button
              onClick={() => navigate('/vendor/venues/add')}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm"
             >
               Create Your First Venue
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
