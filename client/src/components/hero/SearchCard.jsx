import React from 'react'
import { FiSearch, FiMapPin, FiCalendar, FiUsers, FiBox } from 'react-icons/fi'

const SearchCard = () => {
  return (
    <div className="bg-white rounded-[20px] shadow-xl p-6 lg:p-4 w-full flex flex-col lg:flex-row items-center gap-4 lg:gap-2 border border-gray-100 transition-all duration-300 hover:shadow-2xl">

      {/* Location */}
      <div className="flex-1 w-full lg:w-auto px-4 lg:border-r border-gray-200 pb-4 lg:pb-0 border-b lg:border-b-0 group">
        <label className="block text-[11px] font-extrabold text-gray-800 tracking-wider mb-1.5 transition-colors group-hover:text-primary">LOCATION</label>
        <div className="flex items-center text-gray-500">
          <FiMapPin className="mr-3 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
          <input
            type="text"
            placeholder="Where are you going?"
            className="w-full min-w-0 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400 focus:placeholder-gray-300 text-base truncate"
          />
        </div>
      </div>

      {/* Date */}
      <div className="flex-1 w-full lg:w-auto px-4 lg:border-r border-gray-200 pb-4 lg:pb-0 border-b lg:border-b-0 group">
        <label className="block text-[11px] font-extrabold text-gray-800 tracking-wider mb-1.5 transition-colors group-hover:text-primary">DATE</label>
        <div className="flex items-center text-gray-500">
          <FiCalendar className="mr-3 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
          <input
            type="text"
            placeholder="Add dates"
            className="w-full min-w-0 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400 focus:placeholder-gray-300 text-base truncate"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="flex-1 w-full lg:w-auto px-4 lg:border-r border-gray-200 pb-4 lg:pb-0 border-b lg:border-b-0 group">
        <label className="block text-[11px] font-extrabold text-gray-800 tracking-wider mb-1.5 transition-colors group-hover:text-primary">GUESTS</label>
        <div className="flex items-center text-gray-500">
          <FiUsers className="mr-3 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
          <input
            type="text"
            placeholder="Add guests"
            className="w-full min-w-0 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400 focus:placeholder-gray-300 text-base truncate"
          />
        </div>
      </div>

      {/* Venue Type */}
      <div className="flex-1 w-full lg:w-auto px-4 pb-4 lg:pb-0 group">
        <label className="block text-[11px] font-extrabold text-gray-800 tracking-wider mb-1.5 transition-colors group-hover:text-primary">VENUE TYPE</label>
        <div className="flex items-center text-gray-500">
          <FiBox className="mr-3 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
          <input
            type="text"
            placeholder="Any type"
            className="w-full min-w-0 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400 focus:placeholder-gray-300 text-base truncate"
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="w-full lg:w-auto px-4 lg:px-2 flex justify-end lg:pl-4 flex-shrink-0">
        <button className="w-full lg:w-[60px] h-14 lg:h-[60px] bg-primary hover:bg-red-700 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.05]">
          <span className="lg:hidden font-semibold mr-2 text-lg">Search</span>
          <FiSearch className="w-6 h-6" />
        </button>
      </div>

    </div>
  )
}

export default SearchCard
