import React, { useState, useEffect } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import VenueCardLarge from './VenueCardLarge'
import VenueCard from '../venue/VenueCard'
import { getHomeData } from '../../api/user-api/userApi'
import { CardSkeleton } from '../common/Skeleton'

const FeaturedVenues = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const result = await getHomeData()
        setVenues(result.featuredVenues || [])
      } catch (error) {
        console.error('Failed to fetch featured venues:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchVenues()
  }, [])

  const mainVenue = venues[0]
  const secondaryVenues = venues.slice(1, 3)

  return (
    <section className="py-20 bg-background min-h-[500px]">
      <div className="container mx-auto px-4 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
          <div className="mb-4 md:mb-0">
            <h2 className="text-[42px] font-extrabold text-dark mb-3 leading-tight">Featured Venues</h2>
            <p className="text-[18px] text-[#6B7280]">Hand-picked spaces for exceptional experiences.</p>
          </div>
          <button className="hidden sm:flex items-center text-primary font-semibold hover:text-red-700 transition-colors text-lg">
            View All <FiArrowRight className="ml-2" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Large Venue */}
          <div className="h-full">
            {loading ? (
               <CardSkeleton height="h-[400px]" />
            ) : mainVenue ? (
               <VenueCardLarge venue={mainVenue} />
            ) : null}
          </div>

          {/* Right: Small Venues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
            {loading ? (
               <>
                 <CardSkeleton height="h-[200px]" />
                 <CardSkeleton height="h-[200px]" />
               </>
            ) : (
               secondaryVenues.map((venue) => (
                 <VenueCard key={venue.id} venue={venue} />
               ))
            )}
          </div>
        </div>
        
        <button className="sm:hidden mt-8 w-full flex justify-center items-center text-primary font-semibold hover:text-red-700 transition-colors">
          View All <FiArrowRight className="ml-2" />
        </button>
      </div>
    </section>
  )
}

export default FeaturedVenues
