import React from 'react'
import { FiCheckCircle } from 'react-icons/fi'

const TRUST_POINTS = [
  {
    title: 'Verified Venue Owners Only',
    description: 'Every listing is reviewed and KYC-verified before going live. No fake venues.',
  },
  {
    title: 'Real Photos — No Stock Images',
    description: 'Actual photos uploaded by the venue owners, so you see exactly what you get.',
  },
  {
    title: 'Malayalam-Speaking Support',
    description: 'Our support team speaks your language. Reach us in Malayalam, English, or Hindi.',
  },
  {
    title: 'Transparent Pricing',
    description: 'No hidden charges, no surprise fees. The price you see is the price you pay.',
  },
  {
    title: 'Instant Availability Confirmation',
    description: 'No waiting for callbacks. See real-time slot availability and confirm instantly.',
  },
  {
    title: 'All 14 Kerala Districts Covered',
    description: 'From Kasaragod to Thiruvananthapuram — we cover every corner of Kerala.',
  },
]

const WhyUs = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-4xl font-extrabold text-dark mb-4 leading-tight">
            Why Kerala Families Trust BookMyVenue
          </h2>
          <p className="text-lg text-secondary">
            We built this platform for Kerala — with the values Kerala families hold dear.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {TRUST_POINTS.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-dark text-sm mb-1">{point.title}</h4>
                <p className="text-secondary text-sm leading-relaxed">{point.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-secondary text-sm mt-10 font-medium">
          Trusted by <span className="text-dark font-bold">1,000+ families</span> across Kerala for their most important events.
        </p>

      </div>
    </section>
  )
}

export default WhyUs
