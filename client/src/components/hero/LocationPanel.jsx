import React from 'react'
import { FiMapPin, FiClock, FiNavigation } from 'react-icons/fi'

// Only return recent searches that are within Kerala
const isKeralaLocation = (name) =>
  name.toLowerCase() === 'nearby' ||
  name.toLowerCase().includes('kerala')

const getRecentSearches = () => {
  try {
    const all = JSON.parse(localStorage.getItem('bmv_recent_searches') || '[]')
    // Filter out any non-Kerala entries and persist the cleaned list
    const keralOnly = all.filter(isKeralaLocation)
    if (keralOnly.length !== all.length) {
      localStorage.setItem('bmv_recent_searches', JSON.stringify(keralOnly))
    }
    return keralOnly
  } catch {
    return []
  }
}

const SUGGESTED = [
  { icon: <FiNavigation className="w-4 h-4" />, name: 'Nearby', sub: 'Find what\'s around you' },
  { icon: '🏖️', name: 'Thiruvananthapuram, Kerala', sub: 'Capital city of Kerala' },
  { icon: '🌿', name: 'Ernakulam, Kerala', sub: 'Commercial capital of Kerala' },
  { icon: '🕌', name: 'Thrissur, Kerala', sub: 'Cultural capital of Kerala' },
  { icon: '🌊', name: 'Kozhikode, Kerala', sub: 'City of Spices' },
  { icon: '🏝️', name: 'Alappuzha, Kerala', sub: 'Venice of the East' },
  { icon: '🌴', name: 'Kottayam, Kerala', sub: 'Land of Letters & Latex' },
  { icon: '⛰️', name: 'Palakkad, Kerala', sub: 'Gateway of Kerala' },
  { icon: '🌺', name: 'Malappuram, Kerala', sub: 'Near you' },
  { icon: '🏞️', name: 'Kannur, Kerala', sub: 'Land of Looms and Lores' },
  { icon: '🌳', name: 'Kollam, Kerala', sub: 'Cashew Capital of the World' },
  { icon: '🏔️', name: 'Idukki, Kerala', sub: 'Spice Garden of Kerala' },
  { icon: '🌾', name: 'Pathanamthitta, Kerala', sub: 'Pilgrim\'s Capital of Kerala' },
  { icon: '🌻', name: 'Kasaragod, Kerala', sub: 'Land of Seven Languages' },
  { icon: '🎭', name: 'Wayanad, Kerala', sub: 'Green Paradise of Kerala' },
]

const LocationPanel = ({ value, onChange, onSelectLocation }) => {
  const recent = getRecentSearches()

  const handleSelect = (name) => {
    onChange(name)
    onSelectLocation() // move focus to "When"
  }

  // Filter suggestions by current input
  const filtered = value
    ? SUGGESTED.filter(s => s.name.toLowerCase().includes(value.toLowerCase()))
    : SUGGESTED

  return (
    <div className="absolute left-0 top-[calc(100%+12px)] w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 z-[200] animate-fade-in-up">

      {/* Recent searches */}
      {recent.length > 0 && !value && (
        <div className="mb-5">
          <p className="text-xs font-bold text-dark tracking-wider mb-3 uppercase">Recent searches</p>
          <div className="space-y-1">
            {recent.slice(0, 3).map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiClock className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-dark">{r}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested destinations */}
      <div>
        <p className="text-xs font-bold text-dark tracking-wider mb-3 uppercase">
          {value ? 'Destinations' : 'Suggested destinations'}
        </p>
        <div className="space-y-1">
          {filtered.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSelect(s.name)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                {typeof s.icon === 'string' ? s.icon : s.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-dark">{s.name}</p>
                {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex items-center gap-3 px-3 py-3">
              <FiMapPin className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-400">No suggestions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationPanel
