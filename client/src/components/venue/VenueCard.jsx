import React from 'react'
import { FiMapPin, FiStar } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const VenueCard = ({ venue }) => {
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
        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-xs font-bold rounded-full shadow-sm">
          {venue.category || 'Venue'}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 text-dark px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm shadow-sm flex items-center">
          <FiStar className="text-yellow-500 mr-1.5 fill-current w-3.5 h-3.5" />
          {venue.rating || 4.8}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <h4 className="font-extrabold text-dark text-xl mb-2">{venue.name}</h4>
          <div className="flex items-center text-gray-500 text-sm mb-5">
            <FiMapPin className="mr-2 text-gray-400" />
            {venue.location}
          </div>
        </div>

        <div className="flex flex-col border-t border-gray-100 pt-5 space-y-4">
          <div>
            <span className="font-extrabold text-dark text-xl">${venue.price.toLocaleString()}</span>
            <span className="text-gray-500 text-xs ml-1 font-medium">/ day</span>
          </div>
          <button className="w-full py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-dark rounded-xl font-bold transition-colors duration-300">
            Explore Venue
          </button>
        </div>
      </div>
    </div>
  )
}

export default VenueCard
