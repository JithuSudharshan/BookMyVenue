import React, { useState } from 'react'
import { FiHeart, FiStar, FiUsers } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const ListingVenueCard = ({ venue }) => {
  const navigate = useNavigate()
  const [wishlisted, setWishlisted] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <div
      onClick={() => navigate(`/venues/${venue._id || venue.id || ''}`)}
      className="group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 mb-3">
        {venue.image && !imgError ? (
          <img
            src={venue.image}
            alt={venue.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-xs mt-2">No image</span>
          </div>
        )}



        {/* Wishlist Button (Top Right) */}
        <button
          onClick={e => { e.stopPropagation(); setWishlisted(w => !w) }}
          className="absolute top-3 right-3 p-1.5 transition-transform hover:scale-110 active:scale-95"
          aria-label="Save to wishlist"
        >
          {wishlisted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#E53935" stroke="#E53935" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="rgba(0,0,0,0.3)" stroke="white" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="space-y-0.5 px-0.5">
        {/* Name + Rating Row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug truncate flex-1">
            {venue.name}
          </h3>
          {venue.rating !== undefined && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <FiStar className="w-3.5 h-3.5 fill-current text-gray-900" />
              <span className="text-sm font-medium text-gray-900">{venue.rating != null ? Number(venue.rating).toFixed(1) : '0.0'}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <p className="text-sm text-gray-500 truncate">{venue.location || 'Location not specified'}</p>

        {/* Capacity */}
        {venue.capacity && (
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
            <FiUsers className="w-3.5 h-3.5" />
            <span>Up to {venue.capacity} guests</span>
          </p>
        )}

        {/* Category / Type */}
        {venue.category && (
          <p className="text-sm text-gray-500">{venue.category}</p>
        )}

        {/* Price */}
        <p className="text-sm text-gray-900 pt-0.5">
          <span className="font-semibold">₹{venue.price?.toLocaleString('en-IN') || '—'}</span>
          <span className="text-gray-500 font-normal">
            {venue.bookingModel === 'hourly' ? ' / hr' : ' / day'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default ListingVenueCard
