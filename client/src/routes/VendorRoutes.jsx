import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import VendorDashboard from '../pages/vendor/VendorDashboard';
import VendorApplicationStatus from '../pages/vendor/VendorApplicationStatus';
import VendorProfilePage from '../pages/vendor/VendorProfilePage';
import VenueManagement from '../pages/vendor/VenueManagement';
import AddVenue from '../pages/vendor/AddVenue';
import VendorVenueDetailPage from '../pages/vendor/VendorVenueDetailPage';
import VendorBookingsPage from '../pages/vendor/VendorBookingsPage';
import WalletPage from '../pages/common/WalletPage';

const VendorRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<VendorDashboard />} />
      <Route path="application-status" element={<VendorApplicationStatus />} />
      <Route path="profile" element={<VendorProfilePage />} />
      
      {/* Venue Management */}
      <Route path="venues" element={<VenueManagement />} />
      <Route path="venues/add" element={<AddVenue />} />
      <Route path="venues/edit/:id" element={<AddVenue />} />
      <Route path="venues/:id" element={<VendorVenueDetailPage />} />
      
      <Route path="bookings" element={<VendorBookingsPage />} />
      <Route path="wallet" element={<WalletPage />} />
    </Routes>
  );
};

export default VendorRoutes;
