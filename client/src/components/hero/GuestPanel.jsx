import React from 'react'
import { FiMinus, FiPlus, FiUsers } from 'react-icons/fi'

const GuestPanel = ({ guests, onChange }) => {
  return (
    <div className="absolute right-0 top-[calc(100%+12px)] bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 z-50 w-72 animate-fade-in-up">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Number of Guests</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <FiUsers className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-dark">Guests</p>
            <p className="text-xs text-gray-400">No. of guests</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Minus */}
          <button
            onClick={() => onChange(Math.max(0, guests - 1))}
            disabled={guests === 0}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              guests === 0
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-400 text-dark hover:border-dark'
            }`}
          >
            <FiMinus className="w-3 h-3" />
          </button>

          {/* Count */}
          <input
            type="number"
            value={guests === 0 ? '' : guests}
            placeholder="0"
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              onChange(isNaN(val) ? 0 : Math.max(0, val))
            }}
            className="w-16 h-8 text-center text-sm font-bold text-dark border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />

          {/* Plus */}
          <button
            onClick={() => onChange(guests + 1)}
            className="w-8 h-8 rounded-full border border-gray-400 text-dark flex items-center justify-center hover:border-dark transition-colors"
          >
            <FiPlus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {guests > 0 && (
        <button
          onClick={() => onChange(0)}
          className="mt-4 text-xs text-gray-400 hover:text-dark underline underline-offset-2 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}

export default GuestPanel
