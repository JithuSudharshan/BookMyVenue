import React from 'react'
import { FiStar } from 'react-icons/fi'

const TESTIMONIALS = [
  {
    name: 'Anjali Rajesh',
    city: 'Kochi',
    event: 'Wedding',
    stars: 5,
    quote:
      'Booked Greenwood Hall through BookMyVenue for our wedding. The process was seamless and the venue was exactly as shown in the photos. Highly recommended!',
  },
  {
    name: 'Mohammed Ashraf',
    city: 'Calicut',
    event: 'Corporate Event',
    stars: 5,
    quote:
      'Found the perfect corporate seminar venue in minutes. Loved the transparent pricing and instant confirmation. No back-and-forth calls needed.',
  },
  {
    name: 'Priya Nair',
    city: 'Thrissur',
    event: 'Birthday Party',
    stars: 5,
    quote:
      'So easy to compare venues and book! The Malayalam support team was very helpful when I had questions. Will definitely use again for our next event.',
  },
]

const StarRating = ({ count }) => (
  <div className="flex gap-0.5 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <FiStar key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
    ))}
  </div>
)

const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">

        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-4xl font-extrabold text-dark mb-4 leading-tight">
            What Our Customers Say
          </h2>
          <p className="text-lg text-secondary">
            Real stories from real Kerala families who booked through BookMyVenue.
          </p>
        </div>

        {/* 3-column grid on desktop, horizontal scroll on mobile */}
        <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-none">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="
                flex-shrink-0 w-[85vw] md:w-auto snap-center
                bg-gray-50 border border-gray-100 rounded-2xl p-6
                hover:shadow-md transition-shadow relative
              "
            >
              {/* Quote decoration */}
              <span className="absolute top-4 right-5 text-6xl font-serif text-gray-100 leading-none select-none">
                "
              </span>

              <StarRating count={t.stars} />

              <p className="text-gray-700 text-sm leading-relaxed mb-5 relative z-10">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">{t.name}</p>
                  <p className="text-secondary text-xs">{t.city} · {t.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-secondary text-sm mt-10 font-medium">
          Join thousands of happy customers.{' '}
          <a href="/venues" className="text-primary font-semibold hover:underline">
            Find your venue →
          </a>
        </p>

      </div>
    </section>
  )
}

export default Testimonials

