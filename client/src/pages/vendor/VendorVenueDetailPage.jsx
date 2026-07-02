import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiEdit2, FiMapPin, FiUsers, FiStar, FiChevronLeft,
  FiActivity, FiCheck, FiXCircle, FiGrid, FiCopy, FiShare,
  FiShield, FiWind, FiCoffee, FiMonitor, FiWifi, FiInfo
} from 'react-icons/fi'
import { getVendorVenueById, blockVenue, unblockVenue, submitVenue } from '../../api/vendor-api/vendorApi'

// Helper to map amenity strings to icons
const getAmenityIcon = (name) => {
  const n = name.toLowerCase()
  if (n.includes('ac ') || n.includes('air ')) return FiWind
  if (n.includes('wifi') || n.includes('wi-fi')) return FiWifi
  if (n.includes('park')) return FiCheck
  if (n.includes('cater') || n.includes('food')) return FiCoffee
  if (n.includes('pa system') || n.includes('av ') || n.includes('a/v')) return FiMonitor
  return FiCheck
}

const VendorVenueDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState(false)

  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)

  useEffect(() => {
    fetchVenue()
  }, [id])

  const fetchVenue = async () => {
    setLoading(true)
    try {
      const data = await getVendorVenueById(id)
      setVenue(data)
    } catch (err) {
      console.error('Error fetching venue details:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyVenueId = () => {
    if (!venue) return
    navigator.clipboard.writeText(venue._id || venue.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleBlockUnblock = () => {
    if (!venue) return
    setShowBlockModal(true)
  }

  const confirmBlockUnblock = async () => {
    if (!venue) return
    setUpdating(true)
    setShowBlockModal(false)
    try {
      if (venue.isActive) {
        await blockVenue(id)
      } else {
        await unblockVenue(id)
      }
      await fetchVenue()
    } catch (err) {
      console.error('Failed to change venue status:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleSubmitDraft = async () => {
    if (!venue) return
    setUpdating(true)
    try {
      await submitVenue(id)
      await fetchVenue()
    } catch (err) {
      console.error('Failed to submit venue:', err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-dark mb-4">Venue Not Found</h2>
        <button onClick={() => navigate('/vendor/venues')} className="text-primary hover:underline">
          Go Back to Venues
        </button>
      </div>
    )
  }

  // Safe data access
  const price = venue.price || 0
  const advancePercentage = venue.rules?.advanceRequired ? parseInt(venue.rules.advanceRequired) || 30 : 30
  const advanceAmount = Math.round((price * advancePercentage) / 100)

  const categoryName = typeof venue.category === 'object' ? venue.category?.name : venue.category || 'Venue'
  const subCategoryName = typeof venue.subcategory === 'object' ? venue.subcategory?.name : venue.subcategory || ''
  
  const address = typeof venue.location === 'object' ? venue.location?.address : venue.location
  const city = typeof venue.location === 'object' ? venue.location?.city : ''
  const state = typeof venue.location === 'object' ? venue.location?.state : ''
  
  const fullLocation = [address, city, state].filter(Boolean).join(', ') || 'Location details unavailable'
  const shortLocation = [city, state].filter(Boolean).join(', ') || 'Unknown Location'
  
  const images = (venue.images || []).map(img => typeof img === 'string' ? img : img.url)
  // Fill empty image slots with placeholders for the grid
  while (images.length < 5) {
    images.push('https://via.placeholder.com/800x600?text=No+Image')
  }

  const isDraft = (venue.status || '').toLowerCase() === 'draft'

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* ── Top Navigation & Breadcrumb ─────────────────────────────────── */}
      <div className="bg-white px-8 py-5 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
        <button
          onClick={() => navigate('/vendor/venues')}
          className="flex items-center gap-2 text-gray-500 hover:text-dark transition-colors font-semibold"
        >
          <FiChevronLeft className="w-5 h-5" />
          Back to Venues
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/vendor/venues/edit/${id}`)}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-dark font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <FiEdit2 className="w-4 h-4" /> Edit Venue Details
          </button>
          
          {isDraft ? (
            <button 
              onClick={handleSubmitDraft}
              disabled={updating}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <FiCheck className="w-4 h-4" /> {updating ? 'Submitting...' : 'Submit For Approval'}
            </button>
          ) : (
            <button 
              onClick={handleBlockUnblock}
              disabled={updating}
              className="flex items-center gap-2 bg-white border border-[#222222] hover:bg-gray-50 text-[#222222] font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <FiXCircle className="w-4 h-4" /> 
              {updating ? 'Processing...' : venue.isActive ? 'Block Venue' : 'Unblock Venue'}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-6 lg:px-10 pt-6">

        {/* ── Header: Title & Subtitle ───────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-[26px] leading-tight font-semibold text-[#222222] mb-1">
            {venue.name || 'Untitled Venue'}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center text-[15px] font-medium text-[#222222] gap-1.5 flex-wrap">
              <FiStar className="w-4 h-4 fill-current" />
              <span>{venue.rating || '4.5'}</span>
              <span className="text-gray-400 font-normal mx-0.5">·</span>
              <span className="underline hover:cursor-pointer">{venue.reviews || 0} reviews</span>
              <span className="text-gray-400 font-normal mx-0.5">·</span>
              <span className="underline hover:cursor-pointer flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{shortLocation}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-semibold text-[#222222] underline">
              <button className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <FiShare className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* ── 5-Image CSS Grid Gallery ───────────────────────────────────── */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[350px] md:h-[450px] rounded-xl overflow-hidden relative mb-12">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 hover:opacity-95 transition-opacity cursor-pointer bg-gray-100">
            <img src={images[0]} alt="Main" className="w-full h-full object-cover" />
          </div>
          {/* 4 smaller images */}
          <div className="hover:opacity-95 transition-opacity cursor-pointer bg-gray-100"><img src={images[1]} alt="Gallery 1" className="w-full h-full object-cover" /></div>
          <div className="hover:opacity-95 transition-opacity cursor-pointer bg-gray-100"><img src={images[2]} alt="Gallery 2" className="w-full h-full object-cover" /></div>
          <div className="hover:opacity-95 transition-opacity cursor-pointer bg-gray-100"><img src={images[3]} alt="Gallery 3" className="w-full h-full object-cover" /></div>
          <div className="hover:opacity-95 transition-opacity cursor-pointer bg-gray-100"><img src={images[4]} alt="Gallery 4" className="w-full h-full object-cover" /></div>

          {/* Show all photos button */}
          <button className="absolute bottom-6 right-6 bg-white border border-[#222222] px-4 py-1.5 rounded-lg text-sm font-semibold text-[#222222] shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <FiGrid className="w-4 h-4" /> Show all photos
          </button>
        </div>

        {/* ── Two Column Layout ──────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column (Main Content) */}
          <div className="w-full lg:w-[60%]">
            
            {/* Hosted By / Basic Stats */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-[22px] font-semibold text-[#222222] mb-1">
                  Entire {subCategoryName ? subCategoryName.toLowerCase() : categoryName.toLowerCase()} in {city || 'India'}
                </h2>
                <div className="text-[15px] text-[#222222]">
                  Up to {venue.capacity || 0} guests · {categoryName}
                </div>
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 overflow-hidden shadow-sm">
                V
              </div>
            </div>

            {/* Description */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold text-[#222222] mb-4">About this venue</h2>
              <p className="text-[15px] leading-relaxed text-[#222222] whitespace-pre-wrap">
                {venue.description || 'No description provided.'}
              </p>
            </div>

            {/* What this place offers (Amenities) */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold text-[#222222] mb-6">What this place offers</h2>
              {venue.amenities && venue.amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {venue.amenities.map((amenity, idx) => {
                    const amName = typeof amenity === 'object' ? amenity.name : amenity
                    const Icon = getAmenityIcon(amName)
                    return (
                      <div key={idx} className="flex items-center gap-4 text-[15px] text-[#222222]">
                        <Icon className="w-6 h-6 text-gray-700" />
                        {amName}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No amenities listed.</p>
              )}
            </div>

            {/* Rules & Policies */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold text-[#222222] mb-6">Rules & Policies</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiInfo className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-[15px] text-[#222222] block mb-0.5">Rules</span>
                    <span className="text-[15px] text-gray-500 whitespace-pre-wrap">{venue.rules || 'No specific rules provided.'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Sticky Admin & Pricing Card) */}
          <div className="w-full lg:w-[40%] xl:w-[33%] relative">
            <div className="sticky top-28 bg-white border border-[#DDDDDD] rounded-2xl p-6 shadow-xl shadow-black/5">
              
              {/* Pricing Header */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[22px] font-bold text-[#222222]">₹{price.toLocaleString('en-IN')}</span>
                <span className="text-[15px] text-[#222222]">/ {venue.bookingModel === 'hourly' ? 'Hour' : 'Day'}</span>
              </div>

              {/* Status Banner Removed as requested */}

              {/* Booking Config Detail (Phase 4) */}
              <div className="relative w-full border border-gray-400 rounded-xl mb-4 overflow-hidden group">
                <div className="flex border-b border-gray-400 blur-[2.5px] opacity-60">
                  <div className="w-1/2 p-3 border-r border-gray-400">
                    <div className="text-[10px] font-extrabold text-[#222222] mb-0.5">BOOKING MODEL</div>
                    <div className="text-sm text-[#222222] capitalize">{venue.bookingModel || 'Unknown'}</div>
                  </div>
                  <div className="w-1/2 p-3">
                    <div className="text-[10px] font-extrabold text-[#222222] mb-0.5">PRICE TYPE</div>
                    <div className="text-sm text-[#222222]">Per {venue.bookingModel === 'hourly' ? 'Hour' : 'Day'}</div>
                  </div>
                </div>
                
                {/* Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                  <button 
                    onClick={() => {}} 
                    className="bg-[#222222] hover:bg-black text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    View More
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* ── Block/Unblock Confirmation Modal ──────────────────────────── */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-fadeIn">
            <h3 className="text-xl font-bold text-dark mb-2">
              {venue.isActive ? 'Block Venue?' : 'Unblock Venue?'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {venue.isActive 
                ? 'Are you sure you want to block this venue? Guests will no longer be able to see or book it.' 
                : 'Are you sure you want to unblock this venue? It will become visible and bookable for guests again.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockUnblock}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-dark hover:bg-black rounded-xl transition-colors shadow-sm"
              >
                {venue.isActive ? 'Yes, Block Venue' : 'Yes, Unblock Venue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorVenueDetailPage
