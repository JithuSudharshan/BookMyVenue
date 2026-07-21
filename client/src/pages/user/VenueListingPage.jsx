import React, { useEffect, useState, useRef } from 'react'
import ListingVenueCard from '../../components/venue/ListingVenueCard'
import FilterModal from '../../components/venue/FilterModal'
import LocationPanel from '../../components/hero/LocationPanel'
import DatePanel from '../../components/hero/DatePanel'
import GuestPanel from '../../components/hero/GuestPanel'
import { getVenues } from '../../api/user-api/userApi'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating' },
]

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null

// ─── Compact Search Bar (Airbnb-style pill) ────────────────────────────────
const ListingSearchBar = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchRef = useRef(null)

  const [activeField, setActiveField] = useState(null)
  const [locationValue, setLocationValue] = useState(searchParams.get('location') || '')
  
  // Date parsing
  const initialDateStr = searchParams.get('date')
  const initialDate = initialDateStr ? new Date(initialDateStr) : null
  const [dateRange, setDateRange] = useState({ start: initialDate, end: null })
  
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests')) || 0)

  // Close panels when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setActiveField(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !activeField) {
        setIsCompact(true)
      } else {
        setIsCompact(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeField])

  const totalGuests = guests
  const startStr = formatDate(dateRange.start)
  const endStr = formatDate(dateRange.end)
  const dateDisplay = startStr ? (endStr ? `${startStr} – ${endStr}` : startStr) : null

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    
    if (locationValue) params.set('location', locationValue)
    else params.delete('location')
    
    if (dateRange.start) params.set('date', dateRange.start.toISOString().split('T')[0])
    else params.delete('date')
    
    if (totalGuests > 0) params.set('guests', totalGuests)
    else params.delete('guests')
    
    navigate(`/venues?${params.toString()}`)
    setActiveField(null)
  }

  const seg = (field) => `
    relative flex-1 min-w-0 px-5 py-2.5 cursor-pointer rounded-full transition-all duration-200 text-left select-none
    ${activeField === field
      ? 'bg-white shadow-[0_2px_16px_rgba(0,0,0,0.12)]'
      : activeField
        ? 'opacity-60 hover:bg-white/60'
        : 'hover:bg-gray-100/80'
    }
  `

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto min-h-[48px]">
      {isCompact && !activeField ? (
        <div 
          onClick={() => { setIsCompact(false); setActiveField('location'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="mx-auto w-full max-w-[320px] flex items-center justify-between bg-white rounded-full border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 cursor-pointer"
        >
          <div className="flex flex-col truncate pr-2">
            <span className="text-sm font-semibold text-gray-900 truncate">{locationValue || 'Anywhere'}</span>
            <span className="text-[11px] text-gray-500 truncate">
              {dateDisplay ? dateDisplay : 'Any week'} • {guests > 0 ? `${guests} guests` : 'Add guests'}
            </span>
          </div>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <FiSearch className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      ) : (
        /* Pill bar */
        <div className={`
          flex items-center bg-white rounded-full border border-gray-300 shadow-md
          transition-all duration-300
          ${activeField ? 'shadow-xl ring-1 ring-gray-200' : 'hover:shadow-lg'}
        `}>

        {/* WHERE */}
        <div
          className={seg('location')}
          onClick={() => setActiveField(activeField === 'location' ? null : 'location')}
        >
          <p className="text-[10px] font-extrabold text-gray-900 tracking-wider mb-0.5">Where</p>
          <input
            type="text"
            value={locationValue}
            onChange={e => setLocationValue(e.target.value)}
            onFocus={() => setActiveField('location')}
            placeholder="Search destinations"
            className="w-full bg-transparent outline-none text-gray-500 text-sm font-medium placeholder-gray-400 truncate"
          />
        </div>

        {/* Divider */}
        <div className={`w-px h-7 bg-gray-200 flex-shrink-0 transition-opacity ${activeField ? 'opacity-0' : ''}`} />

        {/* WHEN */}
        <div
          className={seg('date')}
          onClick={() => setActiveField(activeField === 'date' ? null : 'date')}
        >
          <p className="text-[10px] font-extrabold text-gray-900 tracking-wider mb-0.5">When</p>
          <p className={`text-sm font-medium truncate ${dateDisplay ? 'text-gray-900' : 'text-gray-400'}`}>
            {dateDisplay || 'Add dates'}
          </p>
        </div>

        {/* Divider */}
        <div className={`w-px h-7 bg-gray-200 flex-shrink-0 transition-opacity ${activeField ? 'opacity-0' : ''}`} />

        {/* WHO */}
        <div
          className={`${seg('guests')} pr-1`}
          onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')}
        >
          <p className="text-[10px] font-extrabold text-gray-900 tracking-wider mb-0.5">Who</p>
          <input
            type="number"
            min="0"
            value={guests === 0 ? '' : guests}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setGuests(isNaN(val) ? 0 : Math.max(0, val));
            }}
            onFocus={() => setActiveField('guests')}
            placeholder="Add guests"
            className="w-full bg-transparent outline-none text-gray-900 text-sm font-medium placeholder-gray-400 truncate [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {/* Search Button */}
        <div className="pr-2 flex-shrink-0">
          <button
            onClick={handleSearch}
            className={`
              flex items-center justify-center rounded-full bg-primary hover:bg-primary/90
              text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg
              ${activeField ? 'w-auto px-4 h-10 gap-2' : 'w-10 h-10'}
            `}
          >
            <FiSearch className="w-4 h-4 flex-shrink-0" />
            {activeField && <span className="text-sm">Search</span>}
          </button>
        </div>
        </div>
      )}

      {/* Drop-down Panels */}
      {activeField === 'location' && (
        <LocationPanel
          value={locationValue}
          onChange={setLocationValue}
          onSelectLocation={() => setActiveField('date')}
        />
      )}
      {activeField === 'date' && (
        <DatePanel
          dateRange={dateRange}
          onChange={setDateRange}
          onClose={() => setActiveField('guests')}
        />
      )}
      {activeField === 'guests' && (
        <GuestPanel
          guests={guests}
          onChange={setGuests}
        />
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
const VenueListingPage = () => {
  const [searchParams] = useSearchParams()
  const [venues, setVenues] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [availableCategories, setAvailableCategories] = useState([{ name: 'All', subcategories: [] }])
  
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [filterMetadata, setFilterMetadata] = useState(null)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})
  const [sortBy, setSortBy] = useState('recommended')
  const [currentPage, setCurrentPage] = useState(1)
  
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const categoryScrollRef = useRef(null)

  // Fetch from Dynamic Backend API whenever filters/params change
  useEffect(() => {
    fetchVenues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedCategory, selectedSubcategory, activeFilters, sortBy, currentPage])

  // Reset to page 1 if any filter (other than page itself) changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchParams, selectedCategory, selectedSubcategory, activeFilters, sortBy])

  const fetchVenues = async () => {
    setLoading(true)
    try {
      const filters = {}
      
      // Extract URL params
      const loc = searchParams.get('location')
      if (loc) filters.location = loc
      
      const g = searchParams.get('guests')
      if (g) filters.guests = g

      // Extract category
      if (selectedCategory && selectedCategory !== 'All') {
        filters.category = selectedCategory
      }
      if (selectedSubcategory) {
        filters.subcategory = selectedSubcategory
      }

      // Extract active filters from modal
      if (activeFilters.priceMin) filters.priceMin = activeFilters.priceMin
      if (activeFilters.priceMax) filters.priceMax = activeFilters.priceMax
      if (activeFilters.selectedCapacity) filters.capacity = activeFilters.selectedCapacity
      if (activeFilters.selectedAmenities?.length) {
        filters.amenities = activeFilters.selectedAmenities.join(',')
      }

      // Sort and Pagination
      filters.sort = sortBy
      filters.page = currentPage
      filters.limit = 12 // Using 12 to fit a 4-col grid nicely

      const result = await getVenues(filters)
      setVenues(result?.venues || [])
      setPagination(result?.pagination || null)
      if (result?.filterMetadata) {
        setFilterMetadata(result.filterMetadata)
      }
      if (result?.availableCategories) {
        setAvailableCategories([{ name: 'All', subcategories: [] }, ...result.availableCategories])
      }
    } catch (error) {
      console.log('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters)
    let count = 0
    if (filters.selectedCapacity) count++
    if (filters.selectedRating) count++
    if (filters.selectedAmenities?.length) count += filters.selectedAmenities.length
    if (filters.priceMin > 0 || filters.priceMax < 50000) count++
    setActiveFilterCount(count)
  }

  const scrollCategories = (dir) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
    }
  }



  if (loading && venues.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Skeleton search bar */}
        <div className="border-b border-gray-100 py-3 bg-white">
          <div className="container mx-auto px-4 lg:px-8 animate-pulse">
            <div className="max-w-2xl mx-auto h-12 bg-gray-200 rounded-full mb-3" />
            <div className="flex gap-6 justify-center">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  <div className="w-14 h-2.5 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded mb-1 w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Sticky Header Bar ─────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">

          {/* Row 1 — Search Bar */}
          <div className="py-3 border-b border-gray-100">
            <ListingSearchBar />
          </div>

          {/* Row 2 — Category Chips + Filters Button */}
          <div className="flex items-center gap-3 py-2.5">

            {/* Left arrow */}
            <button
              onClick={() => scrollCategories(-1)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow text-gray-600"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable chips */}
            <div
              ref={categoryScrollRef}
              className="flex-1 flex gap-1 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {availableCategories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name)
                    setSelectedSubcategory(null)
                  }}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all duration-150 text-xs font-medium whitespace-nowrap ${
                    selectedCategory === cat.name
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scrollCategories(1)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow text-gray-600"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

            {/* Filters Button */}
            <button
              onClick={() => setFilterModalOpen(true)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-150 text-sm font-medium ${
                activeFilterCount > 0
                  ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-white text-gray-900 rounded-full text-xs font-bold flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

          </div>

          {/* Subcategories Row (if applicable) */}
          {selectedCategory !== 'All' && availableCategories.find(c => c.name === selectedCategory)?.subcategories?.length > 0 && (
            <div className="py-2.5 flex items-center gap-2 overflow-x-auto border-t border-gray-50" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  !selectedSubcategory 
                    ? 'border-gray-900 bg-gray-50 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                All {selectedCategory}
              </button>
              {availableCategories.find(c => c.name === selectedCategory).subcategories.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    selectedSubcategory === sub 
                      ? 'border-gray-900 bg-gray-50 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="container mx-auto px-4 lg:px-8 py-8">

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-gray-900">
            {pagination?.totalVenues > 0
              ? `${pagination.totalVenues} venue${pagination.totalVenues > 1 ? 's' : ''} found`
              : 'No venues found'}
            {selectedCategory !== 'All' && (
              <span className="text-gray-500 font-normal"> · {selectedCategory}</span>
            )}
          </h1>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none border border-gray-300 rounded-xl px-4 py-2 pr-8 bg-white text-sm text-gray-700 outline-none focus:border-gray-900 hover:border-gray-400 transition-colors cursor-pointer font-medium shadow-sm"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Overlay when refreshing page */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Grid */}
        {!loading && venues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {venues.map((venue, index) => (
              <ListingVenueCard
                key={venue.id || venue._id || index}
                venue={venue}
              />
            ))}
          </div>
        ) : (!loading && venues.length === 0) ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No venues match your search</h2>
            <p className="text-gray-500 text-sm">Try adjusting your filters, location, or guest count.</p>
            <button
              onClick={() => { 
                setSelectedCategory('All'); 
                setActiveFilters({}); 
                setActiveFilterCount(0);
                setCurrentPage(1);
                // navigate('/venues') to clear URL params if desired, but we'll leave them for now
              }}
              className="mt-5 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {/* Server-side Pagination Controls */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-sm transition-colors ${
                pagination.hasPrevPage ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  p === currentPage ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNextPage}
              className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-sm transition-colors ${
                pagination.hasNextPage ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
        metadata={filterMetadata}
      />
    </div>
  )
}

export default VenueListingPage

