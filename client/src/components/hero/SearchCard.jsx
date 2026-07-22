import React, { useState, useRef, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import LocationPanel from './LocationPanel'
import DatePanel from './DatePanel'
import GuestPanel from './GuestPanel'

const saveRecentSearch = (location) => {
  if (!location.trim()) return
  // Only save Kerala locations
  const lower = location.toLowerCase()
  if (!lower.includes('kerala') && lower !== 'nearby') return
  try {
    const prev = JSON.parse(localStorage.getItem('bmv_recent_searches') || '[]')
    const updated = [location, ...prev.filter(r => r !== location)].slice(0, 5)
    localStorage.setItem('bmv_recent_searches', JSON.stringify(updated))
  } catch { /* ignore */ }
}

const formatDate = (date) =>
  date ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null

const SearchCard = () => {
  const navigate = useNavigate()
  const cardRef = useRef(null)

  // Which field is active — drives which panel is shown
  const [activeField, setActiveField] = useState(null) // null | 'location' | 'date' | 'guests'

  // Field values
  const [locationValue, setLocationValue] = useState('')
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [guests, setGuests] = useState(0)

  // Close all panels when user clicks outside the entire card
  useEffect(() => {
    const handler = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setActiveField(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const totalGuests = guests

  // Date display strings
  const startStr = formatDate(dateRange.start)
  const endStr = formatDate(dateRange.end)
  const dateDisplay = startStr
    ? endStr ? `${startStr} – ${endStr}` : startStr
    : null

  // Segment active styling
  const segmentBase = `
    relative flex-1 px-6 py-3 rounded-full cursor-pointer
    transition-all duration-200 text-left select-none
  `
  const segmentActive = `bg-white shadow-[0_2px_20px_rgba(0,0,0,0.12)]`
  const segmentInactive = `hover:bg-white/60`

  const seg = (field) =>
    `${segmentBase} ${activeField === field ? segmentActive : activeField ? 'opacity-60 ' + segmentInactive : segmentInactive}`

  const handleSearch = () => {
    saveRecentSearch(locationValue)
    const params = new URLSearchParams()
    if (locationValue) params.set('location', locationValue)
    if (dateRange.start) params.set('date', dateRange.start.toISOString().split('T')[0])
    if (totalGuests > 0) params.set('guests', totalGuests)
    navigate(`/venues?${params.toString()}`)
  }

  return (
    <div ref={cardRef} className="relative w-full">

      {/* ── PILL BAR ── */}
      <div className={`
        flex items-center bg-white/80 backdrop-blur-md rounded-full
        border border-gray-200 shadow-lg
        transition-all duration-200
        ${activeField ? 'shadow-xl ring-2 ring-white/50' : ''}
      `}>

        {/* ─── WHERE ─── */}
        <div
          className={seg('location')}
          onClick={() => setActiveField(activeField === 'location' ? null : 'location')}
        >
          <p className="text-[11px] font-extrabold text-dark tracking-wider mb-0.5">Location</p>
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
        <div className={`w-px h-8 bg-gray-200 flex-shrink-0 transition-opacity ${activeField ? 'opacity-0' : 'opacity-100'}`} />

        {/* ─── WHEN ─── */}
        <div
          className={seg('date')}
          onClick={() => setActiveField(activeField === 'date' ? null : 'date')}
        >
          <p className="text-[11px] font-extrabold text-dark tracking-wider mb-0.5">Date</p>
          <p className={`text-sm font-medium truncate ${dateDisplay ? 'text-dark' : 'text-gray-400'}`}>
            {dateDisplay || 'Add dates'}
          </p>
        </div>

        {/* Divider */}
        <div className={`w-px h-8 bg-gray-200 flex-shrink-0 transition-opacity ${activeField ? 'opacity-0' : 'opacity-100'}`} />

        {/* ─── WHO ─── */}
        <div
          className={seg('guests')}
          onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')}
        >
          <p className="text-[11px] font-extrabold text-dark tracking-wider mb-0.5">Guests</p>
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
            className="w-full bg-transparent outline-none text-dark text-sm font-medium placeholder-gray-400 truncate [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>

        {/* ─── SEARCH BUTTON ─── */}
        <div className="pr-2 pl-1 flex-shrink-0">
          <button
            onClick={handleSearch}
            className={`
              flex items-center justify-center rounded-full bg-primary hover:bg-primary/90
              text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg
              ${activeField
                ? 'w-auto px-5 h-12 gap-2'
                : 'w-12 h-12'
              }
            `}
          >
            <FiSearch className="w-5 h-5 flex-shrink-0" />
            {activeField && <span className="text-sm">Search</span>}
          </button>
        </div>
      </div>

      {/* ── PANELS (drop below the pill) ── */}

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

export default SearchCard

