import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UserLayout from '../layouts/UserLayout'
import Home from '../pages/user/Home'
import VenueListingPage from '../pages/user/VenueListingPage'

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="venues" element={<VenueListingPage />} />
      </Route>
    </Routes>
  )
}

export default UserRoutes
