import React, { useState, useContext, useEffect } from 'react'
import BaseCard from '../ui/BaseCard'
import { FiHeart, FiStar, FiUsers } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../store/AuthContext'
import { addToWishlist, removeFromWishlist } from '../../api/user-api/wishlistApi'
import { toast } from 'sonner'

const ListingVenueCard = ({ venue }) => {
  const navigate = useNavigate()
  const { user, updateUser } = useContext(AuthContext)
  const [wishlisted, setWishlisted] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [loading, setLoading] = useState(false)

  const venueId = venue._id || venue.id || ''

  useEffect(() => {
    if (user?.role === 'customer' && user.profile?.wishlist) {
      // Check if venue is in wishlist (MongoDB ObjectIds might be populated objects or string IDs)
      const isWishlisted = user.profile.wishlist.some(item => 
        (typeof item === 'object' && item !== null ? item._id : item) === venueId
      )
      setWishlisted(isWishlisted)
    } else {
      setWishlisted(false)
    }
  }, [user, venueId])

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      toast.info('Login to save to wishlist');
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.info('Only customers can maintain a wishlist');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      if (wishlisted) {
        await removeFromWishlist(venueId);
        setWishlisted(false);
        // Update user context optimistically
        if (user.profile?.wishlist) {
          updateUser({
            profile: {
              wishlist: user.profile.wishlist.filter(item => 
                (typeof item === 'object' && item !== null ? item._id : item) !== venueId
              )
            }
          });
        }
      } else {
        await addToWishlist(venueId);
        setWishlisted(true);
        // Update user context optimistically
        if (user.profile?.wishlist) {
          updateUser({
            profile: {
              wishlist: [...user.profile.wishlist, venueId]
            }
          });
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseCard onClick={() => navigate(`/venues/${venueId}`)} className="group p-3 hover:shadow-md transition-all">
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
          onClick={handleWishlistToggle}
          disabled={loading}
          className="absolute top-3 right-3 p-1.5 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
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
          <div className="flex items-center gap-1 flex-shrink-0">
            <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-gray-900">{venue.rating != null ? Number(venue.rating).toFixed(1) : '0.0'}</span>
            <span className="text-xs text-gray-500">({venue.reviews || 0})</span>
          </div>
        </div>

        {/* Location & Distance */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 truncate">
            {typeof venue.location === 'object' && venue.location !== null
              ? [venue.location.city, venue.location.state].filter(Boolean).join(', ')
              : venue.location || 'Location not specified'}
          </p>
          {venue.distanceKm != null && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full flex-shrink-0">
              📍 {venue.distanceKm} km away
            </span>
          )}
        </div>

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
    </BaseCard>
  )
}

export default ListingVenueCard

