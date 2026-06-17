import React from 'react'

import HeroSection from '../../components/hero/HeroSection'
import CategorySection from '../../components/categories/CategorySection'
import FeaturedVenues from '../../components/featured-venues/FeaturedVenues'
import ExploreVenues from '../../components/explore-venues/ExploreVenues'
import HowItWorks from '../../components/how-it-works/HowItWorks'
import VendorBanner from '../../components/vendor-banner/VendorBanner'

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <CategorySection />
      <FeaturedVenues />
      <ExploreVenues />
      <HowItWorks />
      <VendorBanner />
    </div>
  )
}

export default Home
