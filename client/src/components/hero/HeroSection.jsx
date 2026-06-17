import React from 'react'
import { Link } from 'react-router-dom'
import SearchCard from './SearchCard'

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-[600px] lg:min-h-[700px] flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-white/55"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10 w-full h-full pt-20 pb-32 flex flex-col justify-center items-start text-left">
        <div className="max-w-4xl mb-8 flex flex-col items-start">
          <h1 className="text-[38px] md:text-[52px] lg:text-[64px] font-[800] text-gray-900 leading-[1.1] mb-6 drop-shadow-sm">
            Find and Book the Perfect Venue Near You
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-0 font-medium max-w-[600px]">
            From wedding halls to cafes, discover spaces for every occasion.
          </p>
        </div>

        {/* Embedded Search Card */}
        <div className="w-full max-w-5xl mb-8 animate-fade-in-up">
          <SearchCard />
        </div>
          
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link to="/venues" className="h-12 bg-primary hover:bg-red-700 text-white px-8 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] flex items-center justify-center">
            Explore Venues
          </Link>
          <Link to="/vendor/dashboard" className="h-12 bg-white flex justify-center items-center hover:bg-gray-50 border border-gray-200 text-gray-800 px-8 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.03] shadow-sm">
            Become a Vendor
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
