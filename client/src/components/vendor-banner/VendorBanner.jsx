import React from 'react'
import { Link } from 'react-router-dom'

const VendorBanner = () => {
  return (
    <section className="py-20 bg-white pb-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative w-full rounded-3xl overflow-hidden min-h-[300px] flex items-center shadow-2xl border border-border">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=1632&auto=format&fit=crop")' }}
          ></div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full px-8 py-12 lg:px-16 lg:py-16 gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                Own a space? Become a Vendor.
              </h2>
              <p className="text-gray-300 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0">
                List your venue on BookMyVenue and reach thousands of users looking for spaces just like yours. Manage bookings, payments, and communication all in one place.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <Link to="/vendor/dashboard" className="bg-primary hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg inline-block">
                List Your Space
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VendorBanner
