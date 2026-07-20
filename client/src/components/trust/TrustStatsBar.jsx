import React, { useEffect, useRef, useState } from 'react'

// Animated counter hook using IntersectionObserver
const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || target === 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1)
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
            else setCount(target)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

const Stat = ({ value, suffix = '', label, isLive = false }) => {
  const { count, ref } = useCountUp(isLive ? value : 0)
  const displayValue = isLive ? count : value

  return (
    <div ref={ref} className="flex flex-col items-center text-center px-8 py-6">
      <p className="text-3xl md:text-4xl font-extrabold text-dark">
        {isLive ? displayValue : value}
        <span className="text-primary">{suffix}</span>
      </p>
      <p className="text-sm md:text-base text-secondary font-medium mt-1">{label}</p>
    </div>
  )
}

const TrustStatsBar = ({ totalVenues = 0 }) => {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <Stat
            value={totalVenues}
            suffix="+"
            label="Verified Venues"
            isLive={true}
          />
          <Stat
            value="14"
            label="Districts Covered"
          />
          <Stat
            value="4.8★"
            label="Average Rating"
          />
        </div>
      </div>
    </section>
  )
}

export default TrustStatsBar
