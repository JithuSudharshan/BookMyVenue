import React from 'react'
import HeroSection from '../../components/hero/HeroSection'
import VenuesRow from '../../components/venues-row/VenuesRow'
import HowItWorks from '../../components/how-it-works/HowItWorks'
import VendorBanner from '../../components/vendor-banner/VendorBanner'

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <VenuesRow />
      <HowItWorks />
      <VendorBanner />
    </div>
  )
}

export default Home
