import React, { useState, useEffect } from 'react'

const FilterModal = ({ isOpen, onClose, onApply }) => {
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(5000)
  const [selectedCapacity, setSelectedCapacity] = useState(null)
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [selectedRating, setSelectedRating] = useState(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const amenities = [
    { label: 'High-Speed WiFi', icon: '📶' },
    { label: 'A/V Equipment', icon: '🎙️' },
    { label: 'In-house Catering', icon: '🍽️' },
    { label: 'Parking Available', icon: '🅿️' },
    { label: 'Air Conditioning', icon: '❄️' },
    { label: 'Outdoor Space', icon: '🌿' },
    { label: 'Stage & Lighting', icon: '💡' },
    { label: 'Private Restrooms', icon: '🚻' },
  ]

  const capacities = [
    { label: 'Up to 50', value: '0-50' },
    { label: '50 – 200', value: '50-200' },
    { label: '200 – 500', value: '200-500' },
    { label: '500+', value: '500+' },
  ]

  const ratings = [3, 4, 4.5, 5]

  const toggleAmenity = (label) => {
    setSelectedAmenities(prev =>
      prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]
    )
  }

  const handleClearAll = () => {
    setPriceMin(0)
    setPriceMax(5000)
    setSelectedCapacity(null)
    setSelectedAmenities([])
    setSelectedRating(null)
  }

  const handleApply = () => {
    onApply && onApply({ priceMin, priceMax, selectedCapacity, selectedAmenities, selectedRating })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-base font-bold text-gray-900">Filters</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-7">

          {/* Price Range */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Price range</h3>
            <p className="text-sm text-gray-500 mb-4">Price per hour, includes all fees</p>

            {/* Dual Range Visual */}
            <div className="relative h-10 mb-3">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full" />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#E53935] rounded-full"
                style={{
                  left: `${(priceMin / 5000) * 100}%`,
                  right: `${100 - (priceMax / 5000) * 100}%`,
                }}
              />
              <input
                type="range" min="0" max="5000" step="100"
                value={priceMin}
                onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax - 100))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-10"
                style={{ zIndex: priceMin > 4900 ? 5 : 3 }}
              />
              <input
                type="range" min="0" max="5000" step="100"
                value={priceMax}
                onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin + 100))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-10"
                style={{ zIndex: 4 }}
              />
              {/* Thumb indicators */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-300 rounded-full shadow-md pointer-events-none"
                style={{ left: `calc(${(priceMin / 5000) * 100}% - 10px)` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-300 rounded-full shadow-md pointer-events-none"
                style={{ left: `calc(${(priceMax / 5000) * 100}% - 10px)` }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-center">
                <span className="text-xs text-gray-500 block mb-0.5">Minimum</span>
                <span className="font-semibold text-gray-900 text-sm">${priceMin.toLocaleString()}</span>
              </div>
              <div className="w-4 h-px bg-gray-300" />
              <div className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-center">
                <span className="text-xs text-gray-500 block mb-0.5">Maximum</span>
                <span className="font-semibold text-gray-900 text-sm">${priceMax === 5000 ? '5000+' : priceMax.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Capacity */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Capacity</h3>
            <div className="flex gap-2 flex-wrap">
              {capacities.map(c => (
                <button
                  key={c.value}
                  onClick={() => setSelectedCapacity(selectedCapacity === c.value ? null : c.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 ${
                    selectedCapacity === c.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Amenities */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map(a => (
                <button
                  key={a.label}
                  onClick={() => toggleAmenity(a.label)}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm text-left transition-all duration-150 ${
                    selectedAmenities.includes(a.label)
                      ? 'border-gray-900 bg-gray-50 text-gray-900 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <span className="text-base leading-none">{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Min Rating */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Minimum rating</h3>
            <div className="flex gap-2">
              {ratings.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                  className={`flex-1 py-2 rounded-full border text-sm font-medium transition-all duration-150 ${
                    selectedRating === r
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {r}★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleClearAll}
            className="text-sm font-semibold text-gray-700 underline hover:text-gray-900 transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-gray-900 hover:bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Show venues
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterModal
