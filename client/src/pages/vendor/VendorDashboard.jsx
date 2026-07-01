import React, { useEffect } from 'react';
import { toast } from 'sonner';

const VendorDashboard = () => {

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeVendor');
    if (!hasSeenWelcome) {
      toast.success('Welcome to the Vendor Portal! You have successfully authenticated.');
      sessionStorage.setItem('hasSeenWelcomeVendor', 'true');
    }
  }, []);

  return (
    <div className="w-full">
      <main className="max-w-container-max mx-auto mt-4 px-4 md:px-8">
        
        <div className="bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm relative overflow-hidden min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Vendor Dashboard</h1>
              <p className="font-body-lg text-on-surface-variant">Manage your venues, bookings, and business profile here.</p>
            </div>
          </div>
          
          {/* Mock Dashboard Content to show behind the blur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-on-surface-variant mb-1">Total Venues</h3>
              <p className="font-headline-md text-on-surface">3</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-on-surface-variant mb-1">Active Bookings</h3>
              <p className="font-headline-md text-on-surface">12</p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
              <h3 className="font-label-md text-on-surface-variant mb-1">Wallet Balance</h3>
              <p className="font-headline-md text-on-surface">₹45,000</p>
            </div>
          </div>

          <div className="h-64 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-center">
             <p className="text-on-surface-variant font-body-md">Revenue Chart Placeholder</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
