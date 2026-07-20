import React, { useState, useEffect } from 'react'

const FilterModal = ({ isOpen, onClose, onApply, metadata }) => {
  const defaultMinPrice = metadata?.minPrice ?? 0
  const defaultMaxPrice = metadata?.maxPrice ?? 50000
  const maxCapacityLimit = metadata?.maxCapacity ?? 1000

  const [priceMin, setPriceMin] = useState(defaultMinPrice)
  const [priceMax, setPriceMax] = useState(defaultMaxPrice)
  const [selectedCapacity, setSelectedCapacity] = useState(null)
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [selectedRating, setSelectedRating] = useState(null)

  // Reset local state if metadata bounds change (optional, but good if they change significantly)
  useEffect(() => {
    if (priceMin < defaultMinPrice) setPriceMin(defaultMinPrice)
    if (priceMax > defaultMaxPrice) setPriceMax(defaultMaxPrice)
  }, [defaultMinPrice, defaultMaxPrice])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const generateCapacities = (maxCap) => {
    const caps = []
    if (maxCap >= 50) caps.push({ label: 'Up to 50', value: '0-50' })
    if (maxCap >= 200) caps.push({ label: '50 – 200', value: '50-200' })
    if (maxCap >= 500) caps.push({ label: '200 – 500', value: '200-500' })
    if (maxCap > 500) {
      const topStr = maxCap >= 1000 ? '1000+' : '500+'
      caps.push({ label: topStr, value: topStr })
    }
    return caps.length ? caps : [{ label: 'Any', value: '0-99999' }]
  }

  const capacities = generateCapacities(maxCapacityLimit)

  // Map backend unique strings to icons where possible
  const getIconForAmenity = (label) => {
    const l = label.toLowerCase()
    if (l.includes('wifi') || l.includes('wi-fi')) return '📶'
    if (l.includes('a/v') || l.includes('pa system') || l.includes('mic')) return '🎙️'
    if (l.includes('cater') || l.includes('food')) return '🍽️'
    if (l.includes('park')) return '🅿️'
    if (l.includes('ac ') || l.includes('air cond')) return '❄️'
    if (l.includes('out') || l.includes('lawn')) return '🌿'
    if (l.includes('stage') || l.includes('light')) return '💡'
    if (l.includes('restroom') || l.includes('wash')) return '🚻'
    return '✨'
  }

  const amenities = (metadata?.uniqueAmenities || []).map(a => ({
    label: a,
    icon: getIconForAmenity(a)
  }))

  const ratings = [3, 4, 4.5, 5]

  const toggleAmenity = (label) => {
    setSelectedAmenities(prev =>
      prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label]
    )
  }

  const handleClearAll = () => {
    setPriceMin(defaultMinPrice)
    setPriceMax(defaultMaxPrice)
    setSelectedCapacity(null)
    setSelectedAmenities([])
    setSelectedRating(null)

    if (onApply) {
      onApply({
        priceMin: defaultMinPrice,
        priceMax: defaultMaxPrice,
        selectedCapacity: null,
        selectedAmenities: [],
        selectedRating: null
      })
    }
    onClose()
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

          {/* Capacity (Moved to Top) */}
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

          {/* Price Range */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Price range</h3>
            <p className="text-sm text-gray-500 mb-4">Price per day or per event</p>

            {/* Dual Range Visual */}
            <div className="relative h-10 mb-3">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full" />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#E53935] rounded-full"
                style={{
                  left: `${((priceMin - defaultMinPrice) / (defaultMaxPrice - defaultMinPrice || 1)) * 100}%`,
                  right: `${100 - ((priceMax - defaultMinPrice) / (defaultMaxPrice - defaultMinPrice || 1)) * 100}%`,
                }}
              />
              <input
                type="range" min={defaultMinPrice} max={defaultMaxPrice} step="1000"
                value={priceMin}
                onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax - 1000))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-10"
                style={{ zIndex: priceMin > (defaultMaxPrice - 1000) ? 5 : 3 }}
              />
              <input
                type="range" min={defaultMinPrice} max={defaultMaxPrice} step="1000"
                value={priceMax}
                onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin + 1000))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-10"
                style={{ zIndex: 4 }}
              />
              {/* Thumb indicators */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-300 rounded-full shadow-md pointer-events-none"
                style={{ left: `calc(${((priceMin - defaultMinPrice) / (defaultMaxPrice - defaultMinPrice || 1)) * 100}% - 10px)` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-300 rounded-full shadow-md pointer-events-none"
                style={{ left: `calc(${((priceMax - defaultMinPrice) / (defaultMaxPrice - defaultMinPrice || 1)) * 100}% - 10px)` }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-center">
                <span className="text-xs text-gray-500 block mb-0.5">Minimum</span>
                <span className="font-semibold text-gray-900 text-sm">₹{priceMin.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-4 h-px bg-gray-300" />
              <div className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-center">
                <span className="text-xs text-gray-500 block mb-0.5">Maximum</span>
                <span className="font-semibold text-gray-900 text-sm">₹{priceMax === defaultMaxPrice ? `${defaultMaxPrice.toLocaleString('en-IN')}+` : priceMax.toLocaleString('en-IN')}</span>
              </div>
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
