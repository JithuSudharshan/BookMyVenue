import React from 'react'

const FilterSidebar = () => {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-md border border-gray-100">
      <h3 className="font-extrabold text-lg text-dark mb-6">Filters</h3>

      {/* Venue Category */}
      <div className="mb-6">
        <h4 className="font-bold text-dark mb-3 text-sm tracking-wide">VENUE CATEGORY</h4>
        <div className="space-y-2">
          {['Wedding Halls', 'Corporate Spaces', 'Party Venues', 'Studios'].map(category => (
            <label key={category} className="flex items-center space-x-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
              <span className="text-gray-600 group-hover:text-primary transition-colors">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-bold text-dark mb-3 text-sm tracking-wide">PRICE RANGE</h4>
        <input type="range" className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>$0</span>
          <span>$5000+</span>
        </div>
      </div>

      {/* Capacity */}
      <div className="mb-6">
        <h4 className="font-bold text-dark mb-3 text-sm tracking-wide">CAPACITY</h4>
        <div className="space-y-2">
          {['0 - 50', '50 - 200', '200 - 500', '500+'].map(capacity => (
            <label key={capacity} className="flex items-center space-x-3 cursor-pointer group">
              <input type="radio" name="capacity" className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
              <span className="text-gray-600 group-hover:text-primary transition-colors">{capacity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <h4 className="font-bold text-dark mb-3 text-sm tracking-wide">AMENITIES</h4>
        <div className="space-y-2">
          {['High-Speed WiFi', 'A/V Equipment', 'In-house Catering', 'Parking Available'].map((amenity, index) => (
            <label key={amenity} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                defaultChecked={index === 0 || index === 3} 
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" 
              />
              <span className="text-gray-600 group-hover:text-primary transition-colors">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h4 className="font-bold text-dark mb-3 text-sm tracking-wide">MIN RATING</h4>
        <div className="flex space-x-2">
          {[3, 4, 4.5, 5].map(rating => (
            <button key={rating} className="flex-1 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors">
              {rating}+
            </button>
          ))}
        </div>
      </div>

      <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-dark rounded-xl font-bold transition-colors">
        Reset Filters
      </button>
    </div>
  )
}

export default FilterSidebar
