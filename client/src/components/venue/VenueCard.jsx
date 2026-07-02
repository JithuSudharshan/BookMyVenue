import React, { useState } from 'react'
import { FiStar, FiHeart } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const VenueCard = ({ venue }) => {
  const navigate = useNavigate()
  const [wishlisted, setWishlisted] = useState(false)

  const isGuestFavourite = venue.rating >= 4.8

  const handleCardClick = () => {
    navigate(`/venues/${venue._id || venue.id || ''}`)
  }

  const handleWishlist = (e) => {
    e.stopPropagation()
    setWishlisted(prev => !prev)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group flex-shrink-0 w-[280px] cursor-pointer"
    >
      {/* ── IMAGE ── */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Guest favourite badge */}
        {isGuestFavourite && (
          <div className="absolute top-3 left-3 bg-white text-dark text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Guest favourite
          </div>
        )}

        {/* Wishlist heart */}
        <button
          onClick={handleWishlist}
          aria-label="Save to wishlist"
          className="absolute top-3 right-3 p-1 transition-transform hover:scale-110"
        >
          <FiHeart
            className={`w-5 h-5 drop-shadow transition-colors duration-200
              ${wishlisted ? 'fill-primary text-primary' : 'fill-black/20 text-white'}`}
          />
        </button>
      </div>

      {/* ── INFO ── */}
      <div className="px-0.5">
        {/* Name + Rating row */}
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h4 className="font-semibold text-dark text-sm leading-snug flex-1 truncate">
            {venue.name}
          </h4>
          {venue.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <FiStar className="w-3 h-3 fill-dark text-dark" />
              <span className="text-xs font-medium text-dark">{venue.rating}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <p className="text-gray-400 text-xs mb-1 truncate">{venue.location}</p>

        {/* Price */}
        <p className="text-dark text-sm">
          <span className="font-semibold">₹{venue.price?.toLocaleString()}</span>
          <span className="text-gray-500 font-normal"> / day</span>
        </p>
      </div>
    </div>
  )
}

export default VenueCard
