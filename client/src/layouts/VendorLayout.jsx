import React from 'react'
import { Outlet } from 'react-router-dom'
import VendorSidebar from '../components/vendor/VendorSidebar'
import { FiBell, FiSun, FiMoon } from 'react-icons/fi'

const VendorLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <VendorSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-3 flex-shrink-0">
          {/* Light/Dark toggle placeholder */}
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400">
            <FiSun className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center transition-colors text-white">
            <FiMoon className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Vendor info pill */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
              VN
            </div>
            <span className="text-sm font-semibold text-dark">Vendor Name</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default VendorLayout
