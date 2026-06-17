import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import VendorLayout from '../layouts/VendorLayout'
import VenueManagement from '../pages/vendor/VenueManagement'
import AddVenue from '../pages/vendor/AddVenue'

const VendorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<VendorLayout />}>
        {/* Redirect /vendor to /vendor/venues for now */}
        <Route index element={<Navigate to="venues" replace />} />
        <Route path="venues" element={<VenueManagement />} />
        <Route path="venues/add" element={<AddVenue />} />
        <Route path="dashboard" element={<div className="p-8 text-2xl font-bold">Dashboard (Coming Soon)</div>} />
      </Route>
    </Routes>
  )
}

export default VendorRoutes
