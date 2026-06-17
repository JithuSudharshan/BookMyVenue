import React from 'react'
import { FiEdit2, FiStar, FiImage } from 'react-icons/fi'

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Active':
      return <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>ACTIVE</span>
    case 'Pending':
      return <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>PENDING</span>
    default:
      return <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">DRAFT</span>
  }
}

const VendorVenueCard = ({ venue }) => {
  if (venue.status === 'Draft') {
    return (
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 border-dashed flex flex-col h-full hover:border-gray-300 transition-colors">
        <div className="h-[200px] bg-gray-50 flex items-center justify-center relative p-4">
           <div className="absolute top-4 left-4">
             <StatusBadge status="Draft" />
           </div>
           <FiImage className="w-8 h-8 text-gray-300" />
        </div>
        <div className="p-5 flex flex-col flex-grow justify-between">
          <div>
            <h4 className="font-bold text-dark text-lg mb-1">{venue.name || 'Untitled Venue'}</h4>
            <p className="text-gray-400 text-sm mb-4">Category unassigned</p>
            <div className="flex items-center text-xs text-gray-500 font-medium space-x-2">
              <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[35%] rounded-full"></div>
              </div>
              <span>35% Complete</span>
            </div>
          </div>
          <div className="mt-5 border-t border-gray-100 pt-4 flex justify-center">
            <button className="text-primary font-bold text-sm hover:text-red-700 transition-colors flex items-center">
              Continue Editing <FiEdit2 className="ml-2 w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="h-[200px] overflow-hidden relative">
        <img 
          src={venue.image} 
          alt={venue.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <StatusBadge status={venue.status} />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h4 className="font-bold text-dark text-lg mb-1">{venue.name}</h4>
          <p className="text-gray-500 text-sm mb-3">{venue.category} • {venue.location}</p>
          <div className="flex items-center text-sm font-medium">
            {venue.rating ? (
              <><FiStar className="text-yellow-500 mr-1.5 fill-current" /> <span className="text-dark font-bold mr-1">{venue.rating}</span> <span className="text-gray-400">({venue.reviews} reviews)</span></>
            ) : (
              <><FiStar className="text-gray-300 mr-1.5" /> <span className="text-gray-400">No reviews yet</span></>
            )}
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-end">
          <div className="flex space-x-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5">BASE RATE</p>
              <p className="font-extrabold text-dark text-lg">${venue.price}<span className="text-gray-500 text-xs font-medium">/day</span></p>
            </div>
            {venue.revenue && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 tracking-wider mb-0.5">LIFETIME REV</p>
                <p className="font-extrabold text-dark text-lg">${venue.revenue}k</p>
              </div>
            )}
          </div>
          <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors">
            <FiEdit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VendorVenueCard
