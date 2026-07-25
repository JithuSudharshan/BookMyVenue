import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiEdit2, FiMapPin, FiUsers, FiStar, FiChevronLeft,
  FiActivity, FiCheck, FiXCircle, FiGrid, FiCopy, FiShare,
  FiShield, FiWind, FiCoffee, FiMonitor, FiWifi, FiInfo
} from 'react-icons/fi'
import { toast } from 'sonner'
import { getVendorVenueById, blockVenue, unblockVenue, submitVenue } from '../../api/vendor-api/vendorApi'
import SlotManagementTab from '../../components/vendor/SlotManagementTab'

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
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    fetchVenue()
  }, [id])

  const fetchVenue = async () => {
    setLoading(true)
    try {
      const data = await getVendorVenueById(id)
      setVenue(data)
    } catch (err) {

    } finally {
      setLoading(false)
    }
  }

  const copyVenueId = () => {
    if (!venue) return
    navigator.clipboard.writeText(venue._id || venue.id)
    setCopiedId(true)
    toast.success('Venue ID copied to clipboard')
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
      const isActive = venue.isActive ?? (venue.venueStatus === 'active' && venue.approval?.status === 'approved')
      if (isActive) {
        await blockVenue(id)
        toast.success('Venue blocked successfully')
      } else {
        await unblockVenue(id)
        toast.success('Venue unblocked successfully')
      }
      await fetchVenue()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change venue status')

    } finally {
      setUpdating(false)
    }
  }

  const handleSubmitDraft = async () => {
    if (!venue) return
    setUpdating(true)
    try {
      await submitVenue(id)
      toast.success('Venue submitted for approval')
      await fetchVenue()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit venue')

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

  const isApproved = venue.approval?.status === 'approved'
  const isRejected = venue.approval?.status === 'rejected'
  const isUnderReview = venue.approval?.status === 'under_review'
  const rejectionReason = venue.approval?.rejectionReason || 'No reason provided.'
  const isActive = venue.isActive ?? (venue.venueStatus === 'active' && venue.approval?.status === 'approved')
  const hasAcknowledgedSlots = venue.hasAcknowledgedSlots ?? false

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* ── Top Navigation & Breadcrumb ─────────────────────────────────── */}
      <div className="bg-white px-8 py-5 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/vendor/venues')}
            className="flex items-center gap-2 text-gray-500 hover:text-dark transition-colors font-semibold"
          >
            <FiChevronLeft className="w-5 h-5" />
            Back to Venues
          </button>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'details' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
            >
              Venue Details
            </button>
            <button
              onClick={() => isApproved && setActiveTab('slots')}
              title={!isApproved ? 'Venue must be approved to manage slots' : ''}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                activeTab === 'slots' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'
              } ${!isApproved ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Slot Management
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === 'details' && !isUnderReview && (
            <button 
              onClick={() => navigate(`/vendor/venues/edit/${id}`)}
              className="flex items-center gap-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <FiEdit2 className="w-4 h-4" /> Edit Venue Details
            </button>
          )}
          
          {activeTab === 'details' && isApproved && (
            <button 
              onClick={handleBlockUnblock}
              disabled={updating || (!isActive && !hasAcknowledgedSlots)}
              title={!isActive && !hasAcknowledgedSlots ? 'Confirm slot settings first in the Slot Management tab' : ''}
              className={`flex items-center gap-2 border font-semibold px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 ${
                isActive 
                  ? 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700' 
                  : 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700'
              } ${!isActive && !hasAcknowledgedSlots ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <FiXCircle className="w-4 h-4" /> 
              {updating ? 'Processing...' : isActive ? 'Block Venue' : 'Unblock Venue'}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'details' && (
        <>
          {isRejected && (
            <div className="max-w-[1120px] mx-auto px-6 lg:px-10 pt-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <FiInfo className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-bold text-sm">Venue Rejected</h3>
                  <p className="text-red-600 text-sm mt-1">{rejectionReason}</p>
                  <p className="text-red-500 text-xs mt-2 font-medium">Please edit the venue details to address these issues and resubmit.</p>
                </div>
              </div>
            </div>
          )}

      <div className={`max-w-[1120px] mx-auto px-6 lg:px-10 ${isRejected ? 'pt-6' : 'pt-6'}`}>

        {/* ── Header: Title & Subtitle ───────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-[26px] leading-tight font-semibold text-on-surface mb-1">
            {venue.name || 'Untitled Venue'}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center text-[15px] font-medium text-on-surface gap-1.5 flex-wrap">
              <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{venue.rating || '0.0'}</span>
              <span className="text-gray-400 font-normal mx-0.5">·</span>
              <span className="underline hover:cursor-pointer">{venue.reviews || 0} reviews</span>
              <span className="text-gray-400 font-normal mx-0.5">·</span>
              <span className="underline hover:cursor-pointer flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{shortLocation}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
              <span className={`px-3 py-1.5 rounded-lg border ${
                venue.approval?.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                venue.approval?.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                venue.approval?.status === 'under_review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                venue.approval?.status === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                {venue.approval?.status ? venue.approval.status.replace('_', ' ') : 'UNKNOWN'}
              </span>
              <span className={`px-3 py-1.5 rounded-lg border ${
                venue.venueStatus === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                {(venue.venueStatus || 'INACTIVE')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Dynamic Image Gallery ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-gray-100 ${
                idx === 0 && images.length >= 3 ? 'md:col-span-2' : ''
              }`}
            >
              <img 
                src={img} 
                alt={`Venue Gallery ${idx + 1}`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" 
              />
            </div>
          ))}
        </div>

        {/* ── Two Column Layout ──────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column (Main Content) */}
          <div className="w-full lg:w-[60%]">
            
            {/* Hosted By / Basic Stats */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-[22px] font-semibold text-on-surface mb-1">
                  Entire {subCategoryName ? subCategoryName.toLowerCase() : categoryName.toLowerCase()} in {city || 'India'}
                </h2>
                <div className="text-[15px] text-on-surface">
                  Up to {venue.capacity || 0} guests · {categoryName}
                </div>
              </div>
              <div className="w-14 h-14 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 overflow-hidden shadow-sm">
                V
              </div>
            </div>

            {/* Description */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold text-on-surface mb-4">About this venue</h2>
              <p className="text-[15px] leading-relaxed text-on-surface whitespace-pre-wrap">
                {venue.description || 'No description provided.'}
              </p>
            </div>

            {/* What this place offers (Amenities) */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold text-on-surface mb-6">What this place offers</h2>
              {venue.amenities && venue.amenities.length > 0 ? (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {venue.amenities.map((amenity, idx) => {
                    const amName = typeof amenity === 'object' ? amenity.name : amenity
                    const Icon = getAmenityIcon(amName)
                    return (
                      <div key={idx} className="flex items-center gap-4 text-[15px] text-on-surface">
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
              <h2 className="text-[22px] font-semibold text-on-surface mb-6">Rules & Policies</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiInfo className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-[15px] text-on-surface block mb-0.5">Rules</span>
                    <span className="text-[15px] text-gray-500 whitespace-pre-wrap">{venue.rules || 'No specific rules provided.'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Sticky Admin & Pricing Card) */}
          <div className="w-full lg:w-[40%] xl:w-[33%] relative">
            <div className="sticky top-28 bg-white border border-outline-variant rounded-2xl p-6 shadow-xl shadow-black/5">
              
              {/* Pricing Header */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[22px] font-bold text-on-surface">₹{price.toLocaleString('en-IN')}</span>
                <span className="text-[15px] text-on-surface">/ {venue.bookingModel === 'hourly' ? 'Hour' : 'Day'}</span>
              </div>

              {/* Status Banner Removed as requested */}

                {/* Booking Config Detail (Phase 4) */}
                <div className="relative w-full border border-gray-200 rounded-xl mb-4 overflow-hidden group">
                  <div className="flex bg-gray-50">
                    <div className="w-1/2 p-3 border-r border-gray-200">
                      <div className="text-[10px] font-extrabold text-on-surface mb-0.5">BOOKING MODEL</div>
                      <div className="text-sm text-on-surface capitalize">{venue.bookingModel || 'Unknown'}</div>
                    </div>
                    <div className="w-1/2 p-3">
                      <div className="text-[10px] font-extrabold text-on-surface mb-0.5">PRICE TYPE</div>
                      <div className="text-sm text-on-surface">Per {venue.bookingModel === 'hourly' ? 'Hour' : 'Day'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        </>
      )}

      {activeTab === 'slots' && isApproved && (
        <SlotManagementTab
          venueId={id}
          bookingModel={venue.bookingModel}
          bookingConfig={venue.bookingConfig}
          hasAcknowledgedSlots={venue.hasAcknowledgedSlots ?? false}
          onAcknowledged={fetchVenue}
        />
      )}

      {/* ── Block/Unblock Confirmation Modal ──────────────────────────── */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-fadeIn">
            <h3 className="text-xl font-bold text-dark mb-2">
              {isActive ? 'Block Venue?' : 'Unblock Venue?'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {isActive 
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
                {isActive ? 'Yes, Block Venue' : 'Yes, Unblock Venue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorVenueDetailPage

