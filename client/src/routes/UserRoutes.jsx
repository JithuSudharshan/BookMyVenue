import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UserLayout from '../layouts/UserLayout'
import Home from '../pages/user/Home'
import VenueListingPage from '../pages/user/VenueListingPage'
import VenueDetailPage from '../pages/user/VenueDetailPage'
import PaymentCheckoutPage from '../pages/user/PaymentCheckoutPage'

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="venues" element={<VenueListingPage />} />
        <Route path="venues/:id" element={<VenueDetailPage />} />
        <Route path="booking/pay/:sessionId" element={<PaymentCheckoutPage />} />
      </Route>
    </Routes>
  )
}

export default UserRoutes
