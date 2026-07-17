import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiStar, FiHeart } from 'react-icons/fi'
import { getHomeData } from '../../api/user-api/userApi'
import { AirbnbCardSkeleton } from '../common/Skeleton'
import ListingVenueCard from '../venue/ListingVenueCard'



// ─── Main Section ─────────────────────────────────────────────────────────────
const VenuesRow = ({ activeCategoryId }) => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenuesList = async () => {
      try {
        const result = await getHomeData()
        setVenues(result?.venues || [])
      } catch (err) {
        console.error('Failed to fetch venues:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVenuesList()
  }, [])

  // Filter by active category
  const displayed = activeCategoryId && activeCategoryId !== 'all'
    ? venues.filter(v => v.categoryId === activeCategoryId || v.category === activeCategoryId)
    : venues

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-dark">
            Venues

          </h2>
          <Link
            to="/venues"
            className="flex items-center gap-1.5 text-sm font-semibold text-dark hover:text-primary transition-colors group"
          >
            View all <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Responsive Airbnb grid — fills as many columns as possible */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <AirbnbCardSkeleton key={i} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No venues found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {displayed.map((venue, idx) => (
              <ListingVenueCard key={venue._id || venue.id || idx} venue={venue} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

export default VenuesRow
