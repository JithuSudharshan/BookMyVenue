import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import VenueCard from '../venue/VenueCard'
import { getHomeData } from '../../api/user-api/userApi'
import { AirbnbCardSkeleton } from '../common/Skeleton'

const FeaturedVenues = ({ activeCategoryId }) => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef(null)

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

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  const displayVenues = activeCategoryId && activeCategoryId !== 'all'
    ? venues.filter(v => v.categoryId === activeCategoryId || v.category === activeCategoryId)
    : venues

  const showEmpty = !loading && displayVenues.length === 0

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/venues"
            className="text-[22px] font-bold text-dark hover:underline flex items-center gap-2 group"
          >
            Featured Venues
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center
                         hover:border-dark transition-colors disabled:opacity-25 disabled:cursor-default"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center
                         hover:border-dark transition-colors disabled:opacity-25 disabled:cursor-default"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll row */}
        {showEmpty ? (
          <p className="text-gray-400 text-sm py-8">No featured venues available.</p>
        ) : (
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <AirbnbCardSkeleton key={i} />)
              : displayVenues.map((venue, idx) => (
                  <VenueCard key={`${venue.id}-${idx}`} venue={venue} />
                ))
            }
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedVenues
