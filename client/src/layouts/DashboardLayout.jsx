import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardHeader } from './partials/DashboardHeader';
import { DashboardSidebar } from './partials/DashboardSidebar';
import './DashboardLayout.css';

function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isVendor = user?.role === 'vendor';

  return (
    <div className="dl-root">
      <DashboardHeader 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isVendor={isVendor} 
      />

      <div className="dl-body">
        <DashboardSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          isVendor={isVendor} 
        />

        {/* "??"? Main Content "??"? */}
        <main className="dl-main" style={{ position: 'relative' }}>
          {isVendor ? (
            <Outlet />
          ) : (
            <div className="dl-main-content">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
