import React from 'react'
import { Outlet } from 'react-router-dom'
import VendorSidebar from '../components/vendor/VendorSidebar'
import { FiBell, FiSun, FiMoon } from 'react-icons/fi'

const VendorLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <VendorSidebar />

      <div className="flex-1 flex flex-col min-w-0">

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default VendorLayout
