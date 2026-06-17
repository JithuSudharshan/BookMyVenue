import React, { useState, useEffect } from 'react'
import SectionHeader from '../common/SectionHeader'
import VenueCard from '../venue/VenueCard'
import { getHomeData } from '../../api/user-api/userApi'
import { CardSkeleton } from '../common/Skeleton'

const ExploreVenues = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExploreVenues = async () => {
      try {
        const result = await getHomeData()
        setVenues(result.popularVenues || [])
      } catch (error) {
        console.error('Failed to fetch explore venues:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchExploreVenues()
  }, [])

  // If we have less than 4 venues, duplicate them to show the 4 column layout as requested
  const displayVenues = venues && venues.length > 0 ?
    (venues.length < 4 ? [...venues, ...venues, ...venues, ...venues].slice(0, 4) : venues.slice(0, 8)) : []

  return (
    <section className="py-20 bg-background min-h-[400px]">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="Popular Venues"
          subtitle="Discover hand-picked venues perfect for weddings, corporate events, celebrations, and special occasions."
          actionText="View All Venues"
          actionLink="/venues"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => <CardSkeleton key={idx} height="h-[200px]" />)
          ) : (
            displayVenues.map((venue, index) => (
              <VenueCard key={`${venue.id}-${index}`} venue={venue} />
            ))
          )}
        </div>

        <div className="sm:hidden mt-10 w-full flex justify-center">
          <a
            href="/venues"
            className="bg-gray-100 hover:bg-gray-200 text-dark px-8 py-3 rounded-lg font-bold transition-colors shadow-sm"
          >
            View All Venues
          </a>
        </div>
      </div>
    </section>
  )
}

export default ExploreVenues
