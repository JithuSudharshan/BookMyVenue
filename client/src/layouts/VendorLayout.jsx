import React from 'react'
import { Outlet } from 'react-router-dom'
import VendorSidebar from '../components/vendor/VendorSidebar'

const VendorLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <VendorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* We can include a top header here if needed, or handle per page */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default VendorLayout
