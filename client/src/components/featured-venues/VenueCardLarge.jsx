import React from 'react'
import { FiMapPin, FiStar } from 'react-icons/fi'

const VenueCardLarge = ({ venue }) => {
  return (
    <div className="group relative h-full min-h-[450px] lg:min-h-[550px] rounded-[20px] overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-gray-100">
      <img 
        src={venue.image} 
        alt={venue.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Top Badge */}
      <div className="absolute top-6 right-6 bg-white/90 text-dark px-4 py-1.5 text-sm font-bold rounded-full backdrop-blur-sm shadow-sm flex items-center">
        <FiStar className="text-yellow-500 mr-1.5 fill-current w-4 h-4" />
        {venue.rating || 4.8}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
        <div className="bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-full w-max mb-4 shadow-sm">
          Available
        </div>
        <h3 className="text-white font-extrabold text-3xl lg:text-4xl mb-3 leading-tight">{venue.name}</h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center text-gray-200 text-sm mb-6 space-y-2 sm:space-y-0 sm:space-x-4 font-medium">
          <div className="flex items-center">
            <FiMapPin className="mr-2" />
            {venue.location}
          </div>
        </div>

        <div className="text-white text-lg flex items-end">
          <span className="font-extrabold text-3xl">${venue.price.toLocaleString()}</span> <span className="text-gray-300 text-sm ml-2 mb-1">/ day</span>
        </div>
      </div>
    </div>
  )
}

export default VenueCardLarge
