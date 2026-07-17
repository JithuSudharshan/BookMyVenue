import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'

const PERKS = [
  'List your venue for free',
  'Manage bookings in one place',
  'Reach thousands of customers',
]

const VendorBanner = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="rounded-3xl overflow-hidden border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[320px]">

            {/* Left — Text + CTA */}
            <div className="flex flex-col justify-center px-10 py-12 lg:py-16">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                For Venue Owners
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-dark leading-tight mb-4">
                Own a space?<br />Become a Vendor.
              </h2>
              <p className="text-gray-500 text-base mb-6 max-w-sm leading-relaxed">
                List your venue on BookMyVenue and reach thousands of users looking for the perfect space.
              </p>

              {/* Perks */}
              <ul className="space-y-2 mb-8">
                {PERKS.map((perk, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <FiCheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>

              <a
                href="/api/auth/register-vendor"
                className="inline-flex items-center gap-2 bg-primary hover:bg-red-700
                           text-white font-semibold px-7 py-3.5 rounded-xl
                           transition-colors shadow-md hover:shadow-lg w-max"
              >
                Become a Vendor
                <FiArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Right — Static Image */}
            <div className="hidden lg:block relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80"
                alt="Venue interior"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default VendorBanner
