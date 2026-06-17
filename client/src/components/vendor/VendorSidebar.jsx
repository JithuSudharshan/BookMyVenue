import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiGrid, FiCalendar, FiMap, FiPieChart, FiCreditCard, FiSettings, FiPlus } from 'react-icons/fi'

const VendorSidebar = () => {
  const location = useLocation()
  
  const navItems = [
    { name: 'Dashboard', icon: FiGrid, path: '/vendor/dashboard' },
    { name: 'Bookings', icon: FiCalendar, path: '/vendor/bookings' },
    { name: 'My Venues', icon: FiMap, path: '/vendor/venues' },
    { name: 'Analytics', icon: FiPieChart, path: '/vendor/analytics' },
    { name: 'Wallet', icon: FiCreditCard, path: '/vendor/wallet' },
    { name: 'Settings', icon: FiSettings, path: '/vendor/settings' },
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <aside className="w-64 bg-[#F8F9FA] border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 min-h-screen">
      <div className="p-6">
        <Link to="/vendor/dashboard" className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
            V
          </div>
          <div>
            <h2 className="font-bold text-primary text-lg leading-tight">Vendor Portal</h2>
            <p className="text-xs text-gray-500">Manage your venues</p>
          </div>
        </Link>

        <Link 
          to="/vendor/venues/add"
          className="w-full flex items-center justify-center bg-primary hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm mb-8"
        >
          <FiPlus className="mr-2" /> Add New Venue
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 text-dark font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-dark'
            }`}
          >
            <item.icon className={`mr-3 w-5 h-5 ${isActive(item.path) ? 'text-gray-700' : 'text-gray-400'}`} />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default VendorSidebar
