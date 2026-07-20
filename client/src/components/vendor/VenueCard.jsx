import React, { useState } from 'react'
import { FiMapPin, FiUsers, FiMoreVertical, FiStar } from 'react-icons/fi'

const VenueCard = ({ venue, onViewDetails }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const image = venue.image || venue.images?.[0]?.url || venue.images?.[0] || 'https://via.placeholder.com/150'
  const categoryName = venue.categoryName || (typeof venue.category === 'object' ? venue.category?.name : venue.category) || 'Venue'
  
  let locationText = 'Location missing';
  if (venue.locationText) {
    locationText = venue.locationText;
  } else if (venue.location && typeof venue.location === 'object') {
    locationText = `${venue.location.city || ''}, ${venue.location.state || ''}`.replace(/^, | , $/g, '').replace(/^,$/, '');
  } else if (venue.location) {
    locationText = venue.location;
  }
  if (!locationText) locationText = 'Location missing';

  const isActive = venue.isActive ?? (venue.venueStatus === 'active' && venue.approval?.status === 'approved')
  const isDraft = venue.approval?.status === 'draft'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Card Header: status badge + menu */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        {isActive
          ? <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full" />Active</span>
          : <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"><span className="w-2 h-2 bg-gray-400 rounded-full" />Inactive</span>
        }
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
          <div className="flex items-center gap-1.5 text-xs mb-1.5">
            <FiStar className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="font-bold text-dark">{venue.rating || '0.0'}</span>
            <span className="text-gray-400">({venue.reviews || 0})</span>
            <span className="text-gray-300 mx-0.5">•</span>
            <span className="text-gray-500 truncate">{categoryName}</span>
          </div>
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
          className={`border text-xs font-bold px-4 py-2 rounded-lg transition-all ${
            isDraft 
              ? 'border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white'
              : 'border-primary text-primary hover:bg-primary hover:text-white'
          }`}
        >
          {isDraft ? 'Continue' : 'View Details'}
        </button>
      </div>
    </div>
  )
}

export default VenueCard
