import React, { useState } from 'react'
import { FiMapPin, FiUsers, FiMoreVertical } from 'react-icons/fi'

const VenueCard = ({ venue, onViewDetails }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const image = venue.images?.[0]?.url || venue.images?.[0] || 'https://via.placeholder.com/150'
  const categoryName = typeof venue.category === 'object' ? venue.category?.name : venue.category || 'Venue'
  const locationText = typeof venue.location === 'object'
    ? `${venue.location?.city || ''}, ${venue.location?.state || ''}`.replace(/^, | , $/g, '')
    : venue.location || 'Location missing'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Card Header: status badge + menu */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        {venue.isActive
          ? <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full" />Active</span>
          : <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"><span className="w-2 h-2 bg-gray-400 rounded-full" />Inactive</span>
        }
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiMoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1">
              <button
                onClick={() => { setMenuOpen(false); onViewDetails(venue) }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                View / Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image + basic info */}
      <div className="flex items-start gap-3 px-4 pb-3">
        <img
          src={image}
          alt={venue.name}
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-100"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-dark text-[15px] leading-snug truncate">{venue.name || 'Untitled Venue'}</h3>
          <p className="text-xs text-gray-500 mb-1.5 truncate">{categoryName}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <FiMapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FiUsers className="w-3 h-3 flex-shrink-0" />
            <span>Up to {venue.capacity || 0} Guests</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-100" />

      {/* Footer: price + CTA */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <span className="font-extrabold text-dark text-base">₹{venue.price?.toLocaleString('en-IN') || '0'}</span>
          <span className="text-xs text-gray-500 ml-1">/ {venue.bookingModel === 'hourly' ? 'Hour' : 'Day'}</span>
        </div>
        <button
          onClick={() => onViewDetails(venue)}
          className="border border-primary text-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default VenueCard
