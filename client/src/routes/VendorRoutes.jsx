import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import VendorLayout from '../layouts/VendorLayout'
import VenueManagement from '../pages/vendor/VenueManagement'
import AddVenue from '../pages/vendor/AddVenue'
import VendorVenueDetailPage from '../pages/vendor/VendorVenueDetailPage'

// Placeholder pages (to be built out later)
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="text-5xl mb-4">🚧</div>
    <h2 className="text-2xl font-extrabold text-dark mb-2">{title}</h2>
    <p className="text-gray-400 text-sm">This section is under construction. Check back soon!</p>
  </div>
)

const VendorRoutes = () => {
  return (
    <Routes>
      {/* ── Dashboard layout (with sidebar) ── */}
      <Route path="/" element={<VendorLayout />}>
        {/* Redirect /vendor → /vendor/venues */}
        <Route index element={<Navigate to="venues" replace />} />

        {/* Venue Management */}
        <Route path="venues"      element={<VenueManagement />} />
        <Route path="venues/add"  element={<AddVenue />} />
        <Route path="venues/edit/:id" element={<AddVenue />} />
        <Route path="venues/:id"  element={<VendorVenueDetailPage />} />

        {/* Placeholder routes */}
        <Route path="dashboard"  element={<ComingSoon title="Dashboard" />} />
        <Route path="bookings"   element={<ComingSoon title="Bookings" />} />
        <Route path="analytics"  element={<ComingSoon title="Analytics" />} />
        <Route path="wallet"     element={<ComingSoon title="Wallet & Payouts" />} />
        <Route path="profile"    element={<ComingSoon title="Profile" />} />
        <Route path="settings"   element={<ComingSoon title="Settings" />} />
      </Route>
    </Routes>
  )
}

export default VendorRoutes

