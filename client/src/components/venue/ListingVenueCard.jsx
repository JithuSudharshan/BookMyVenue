import React from 'react'
import { FiMapPin, FiStar, FiHeart, FiArrowRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const ListingVenueCard = ({ venue, isTopRated }) => {
  const navigate = useNavigate()

  return (
    <div 
      onClick={() => navigate('/venues')}
      className="group bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col cursor-pointer h-full"
    >
      <div className="h-[220px] overflow-hidden relative">
        <img 
          src={venue.image} 
          alt={venue.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isTopRated && (
          <div className="absolute top-4 left-4 bg-white/90 text-dark px-3 py-1 text-xs font-bold rounded-md backdrop-blur-sm shadow-sm">
            Top Rated
          </div>
        )}
        <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors">
          <FiHeart className="text-white w-4 h-4" />
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-extrabold text-dark text-xl pr-2">{venue.name}</h4>
            <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-xs font-bold text-dark flex-shrink-0">
              <FiStar className="text-yellow-500 mr-1 fill-current w-3 h-3" />
              {venue.rating || 4.9}
            </div>
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <FiMapPin className="mr-1.5 w-4 h-4 text-gray-400" />
            {venue.location}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">Up to 250 Guests</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">Indoor</span>
          </div>
        </div>
        
        <div className="flex border-t border-gray-100 pt-5 justify-between items-end mt-auto">
          <div className="flex items-baseline">
            <span className="font-extrabold text-primary text-[28px] leading-none">${venue.price || '450'}</span>
            <span className="text-dark text-sm ml-1 font-medium">/ hr</span>
          </div>
          <button className="text-primary font-bold text-sm flex items-center hover:text-red-700 transition-colors">
            View Detail <FiArrowRight className="ml-1.5 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListingVenueCard
