import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiGrid, FiCalendar, FiMap, FiBarChart2,
  FiCreditCard, FiUser, FiSettings, FiPlus, FiHelpCircle
} from 'react-icons/fi'

const navItems = [
  { name: 'Dashboard',      icon: FiGrid,      path: '/vendor/dashboard' },
  { name: 'Bookings',       icon: FiCalendar,  path: '/vendor/bookings' },
  { name: 'Venues',         icon: FiMap,       path: '/vendor/venues' },
  { name: 'Analytics',      icon: FiBarChart2, path: '/vendor/analytics' },
  { name: 'Wallet & Payouts', icon: FiCreditCard, path: '/vendor/wallet' },
  { name: 'Profile',        icon: FiUser,      path: '/vendor/profile' },
  { name: 'Settings',       icon: FiSettings,  path: '/vendor/settings' },
]

const VendorSidebar = () => {
  const location = useLocation()

  const isActive = (path) =>
    location.pathname === path ||
    (path === '/vendor/venues' && location.pathname.startsWith('/vendor/venues'))

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 min-h-screen">

      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link to="/vendor/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            V
          </div>
          <div>
            <h2 className="font-extrabold text-primary text-base leading-tight">Vendor Portal</h2>
            <p className="text-[11px] text-gray-400">Manage your venues</p>
          </div>
        </Link>
      </div>

      {/* Add New Venue button */}
      <div className="px-4 pb-5">
        <Link
          to="/vendor/venues/add"
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
        >
          <FiPlus className="w-4 h-4" />
          Add New Venue
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-red-50 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-dark'
              }`}
            >
              <item.icon
                className={`w-4.5 h-4.5 flex-shrink-0 ${
                  active ? 'text-primary' : 'text-gray-400'
                }`}
                style={{ width: 18, height: 18 }}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Help footer */}
      <div className="p-4">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center flex-shrink-0">
            <FiHelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-dark">Need Help?</p>
            <p className="text-[11px] text-gray-400">Contact support</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default VendorSidebar
