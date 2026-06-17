import React, { useEffect, useState } from 'react'
import FilterSidebar from '../../components/venue/FilterSidebar'
import ListingVenueCard from '../../components/venue/ListingVenueCard'
import { getVenues } from '../../api/user-api/userApi'

const VenueListingPage = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const result = await getVenues()
      setVenues(result || [])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-background">
        <div className="animate-pulse text-2xl font-bold text-primary">Loading Venues...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-dark mb-4">Explore All Venues</h1>
          <p className="text-gray-500 text-lg">Find the perfect space for your next memorable event.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-12">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Venue Grid */}
          <div className="w-full lg:w-3/4">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-[28px] font-extrabold text-dark mb-1">Found 124 Venues</h2>
                <p className="text-gray-500 text-sm">Showing results for corporate events.</p>
              </div>
              <div className="relative">
                <select className="appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 bg-white text-sm text-gray-700 outline-none focus:border-primary shadow-sm hover:border-gray-400 transition-colors cursor-pointer">
                  <option>Sort by: Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highest Rated</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {venues.map((venue, index) => (
                <ListingVenueCard key={`${venue.id}-${index}`} venue={venue} isTopRated={index === 0} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-16 flex justify-center items-center space-x-2">
              <button className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white rounded-md text-gray-400 cursor-not-allowed">
                &lt;
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-[#b81d18] text-white rounded-md font-medium shadow-sm">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white rounded-md text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white rounded-md text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors">
                3
              </button>
              <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                ...
              </span>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white rounded-md text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                &gt;
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default VenueListingPage
