import React from 'react'
import SearchCard from './SearchCard'

const HeroSection = () => {
  return (
    /*
      overflow-visible is critical — lets dropdown panels escape this section.
      z-[10] keeps it below the sticky navbar (z-50) but the search wrapper
      inside is z-[100] so panels float above categories/venues.
    */
    <div className="relative w-full bg-gray-50 border-b border-gray-200 z-[10] overflow-visible">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Search wrapper — high z-index so panels float above next sections */}
        <div className="relative z-[100] w-full max-w-4xl mx-auto">
          <SearchCard />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
