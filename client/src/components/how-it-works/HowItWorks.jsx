import React from 'react'
import { FiSearch, FiLayers, FiCheckCircle, FiStar } from 'react-icons/fi'

const STEPS = [
  {
    icon: FiSearch,
    number: '1',
    title: 'Search',
    description: 'Browse venues by location, date, capacity & category across all 14 Kerala districts.',
  },
  {
    icon: FiLayers,
    number: '2',
    title: 'Compare',
    description: 'View real photos, transparent pricing, amenities & real-time availability side-by-side.',
  },
  {
    icon: FiCheckCircle,
    number: '3',
    title: 'Book Instantly',
    description: 'Confirm your date with no back-and-forth. Instant availability — no waiting, no calls.',
  },
  {
    icon: FiStar,
    number: '4',
    title: 'Celebrate',
    description: 'Arrive at a verified, fully prepared venue and enjoy your special event in Kerala.',
  },
]

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-dark mb-4 leading-tight">
            How It Works
          </h2>
          <p className="text-lg text-secondary">
            Booking your perfect Kerala venue is simple, transparent, and completely digital.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">

          {/* Dotted connector line — desktop only */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-gray-200 z-0" />

          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="flex flex-col items-center text-center px-4 pb-8 md:pb-0 relative z-10">
                {/* Number circle */}
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-5 bg-white shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Step label */}
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                  Step {step.number}
                </span>
                <h3 className="text-lg font-bold text-dark mb-2">{step.title}</h3>
                <p className="text-sm text-secondary leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default HowItWorks

