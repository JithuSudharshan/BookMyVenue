import React from 'react'
import { useNavigate } from 'react-router-dom'
import SearchCard from './SearchCard'

const KERALA_CITIES = [
  'Kochi',
  'Thrissur',
  'Calicut',
  'Trivandrum',
  'Palakkad',
  'Kannur',
]

const HeroSection = () => {
  const navigate = useNavigate()

  const handleCityClick = (city) => {
    navigate(`/venues?location=${encodeURIComponent(city)}`)
  }

  return (
    /*
      z-[50] elevates this entire section above the sticky CategoryStrip (z-40),
      so search panel dropdowns (z-[200]) inside always float on top of everything.
      overflow-visible is critical — lets dropdown panels escape this section's bounds.
    */
    <div className="relative w-full z-[50] overflow-visible">

      {/* ── Background Image Layer ── */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2098&q=80"
          alt="Beautiful Kerala venue"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      {/* ── Content Layer ── */}
      <div className="relative container mx-auto px-4 lg:px-8 py-20 md:py-28 flex flex-col items-center text-center">

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg max-w-3xl">
          Find & Book the Perfect{' '}
          <span className="text-red-400">Venue</span> in Kerala
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-lg text-white/85 font-medium mb-8 max-w-xl drop-shadow">
          Weddings · Birthdays · Corporate Events · and more across all 14 districts
        </p>

        {/* Search Card — high z-index so its dropdowns float above everything */}
        <div className="relative z-[200] w-full max-w-4xl">
          <SearchCard />
        </div>

        {/* ── City Quick-Pick Chips ── */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="text-white/60 text-sm font-medium self-center mr-1">
            Popular:
          </span>
          {KERALA_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleCityClick(city)}
              className="
                px-4 py-1.5 rounded-full text-sm font-semibold
                bg-white/15 text-white border border-white/30
                hover:bg-white hover:text-gray-900
                backdrop-blur-sm transition-all duration-200
                active:scale-95
              "
            >
              {city}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}

export default HeroSection

