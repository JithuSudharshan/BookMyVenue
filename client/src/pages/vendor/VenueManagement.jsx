import React, { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import VendorVenueCard from '../../components/vendor/VendorVenueCard'

// Mock Data matching Figma
const mockVendorVenues = [
  {
    id: 1,
    name: 'The Grand Azure',
    category: 'Banquet Hall',
    location: 'Downtown',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop',
    rating: 4.9,
    reviews: 124,
    price: '3,500',
    revenue: '142.5',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Whispering Pines',
    category: 'Outdoor/Barn',
    location: 'Westside',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop',
    rating: null,
    reviews: 0,
    price: '2,500',
    revenue: null,
    status: 'Pending'
  },
  {
    id: 3,
    name: 'Summit Executive',
    category: 'Meeting Room',
    location: 'Financial Dist.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    rating: 4.6,
    reviews: 89,
    price: '800',
    revenue: '54.2',
    status: 'Active'
  },
  {
    id: 4,
    status: 'Draft',
    name: 'Untitled Venue'
  }
]

const VenueManagement = () => {
  const [activeFilter, setActiveFilter] = useState('All Status')

  return (
    <div className="p-8 lg:p-12 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-dark mb-1">Venue Management</h1>
          <p className="text-gray-500">View, edit, and manage your listed properties.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 flex-1 md:w-64">
            <FiSearch className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search venues..." 
              className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder-gray-400"
            />
          </div>
          <div className="flex items-center space-x-1 pr-1">
            {['All Status', 'Active', 'Pending'].map(status => (
              <button 
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeFilter === status 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockVendorVenues.map(venue => (
          <VendorVenueCard key={venue.id} venue={venue} />
        ))}
      </div>

      {/* Load More */}
      <div className="mt-12 flex justify-center">
        <button className="px-6 py-2.5 bg-white border border-gray-200 text-dark font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm">
          Load More Venues
        </button>
      </div>

    </div>
  )
}

export default VenueManagement
