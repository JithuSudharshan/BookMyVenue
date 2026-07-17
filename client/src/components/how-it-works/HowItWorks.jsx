import React from 'react'
import { FiSearch, FiCalendar, FiStar } from 'react-icons/fi'

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-[42px] font-extrabold text-dark mb-4 leading-tight">How It Works</h2>
          <p className="text-[18px] text-[#6B7280]">
            Booking your perfect venue is simple, transparent, and completely digital.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-primary mb-6">
              <FiSearch className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">1. Discover</h3>
            <p className="text-secondary leading-relaxed text-sm md:text-base">
              Browse curated list of venues. Filter by location, date, capacity, and aesthetic to find your match.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-primary mb-6">
              <FiCalendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">2. Book Securely</h3>
            <p className="text-secondary leading-relaxed text-sm md:text-base">
              Review availability in real-time and secure your date instantly with our secure payment gateway.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-primary mb-6">
              <FiStar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">3. Celebrate</h3>
            <p className="text-secondary leading-relaxed text-sm md:text-base">
              Arrive and enjoy. Our vendors ensure everything is prepared according to your booking details.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}

export default HowItWorks
