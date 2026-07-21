import React, { useState, useEffect } from 'react'
import HeroSection from '../../components/hero/HeroSection'
import CategoryStrip from '../../components/categories/CategoryStrip'
import TrustStatsBar from '../../components/trust/TrustStatsBar'
import VenuesRow from '../../components/venues-row/VenuesRow'
import HowItWorks from '../../components/how-it-works/HowItWorks'
import WhyUs from '../../components/why-us/WhyUs'
import Testimonials from '../../components/testimonials/Testimonials'
import VendorBanner from '../../components/vendor-banner/VendorBanner'
import { getHomeData } from '../../api/user-api/userApi'

const Home = () => {
  const [homeData, setHomeData] = useState({ venues: [], categories: [], stats: { totalVenues: 0 } })
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const data = await getHomeData()
        setHomeData({
          venues: data?.venues || [],
          categories: data?.categories || [],
          stats: data?.stats || { totalVenues: 0 },
        })
      } catch (err) {

      } finally {
        setLoading(false)
      }
    }
    fetchHome()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero — Full Kerala image + headline + search + city chips */}
      <HeroSection />

      {/* 2. Category Strip — dynamic from DB */}
      <CategoryStrip
        categories={homeData.categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* 3. Trust Stats Bar — live venue count */}
      <TrustStatsBar totalVenues={homeData.stats.totalVenues} />

      {/* 4. Venue Grid — category-filtered */}
      <VenuesRow
        venues={homeData.venues}
        loading={loading}
        activeCategory={activeCategory}
      />

      {/* 5. How It Works */}
      <HowItWorks />

      {/* 6. Why BookMyVenue */}
      <WhyUs />

      {/* 7. Testimonials */}
      <Testimonials />

      {/* 8. Vendor CTA */}
      <VendorBanner />
    </div>
  )
}

export default Home

