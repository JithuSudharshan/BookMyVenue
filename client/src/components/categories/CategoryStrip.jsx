import React from 'react'
import { useNavigate } from 'react-router-dom'

const CategoryStrip = ({ categories = [], activeCategory, onSelect }) => {
  const navigate = useNavigate()

  const handleSelect = (categoryName) => {
    if (onSelect) {
      onSelect(categoryName)
    } else {
      if (categoryName === 'All') {
        navigate('/venues')
      } else {
        navigate(`/venues?category=${encodeURIComponent(categoryName)}`)
      }
    }
  }

  const allItems = [{ name: 'All', image: null }, ...categories]

  return (
    <section className="bg-white border-b border-gray-100 sticky top-[72px] z-40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-5 overflow-x-auto py-4 scrollbar-none">

          {allItems.map((cat) => {
            const isActive = (activeCategory || 'All') === cat.name

            // "All" chip — simple text pill
            if (!cat.image) {
              return (
                <button
                  key={cat.name}
                  onClick={() => handleSelect(cat.name)}
                  className={`
                    flex-shrink-0 flex flex-col items-center gap-1.5 group
                    transition-all duration-200
                  `}
                >
                  {/* Placeholder circle */}
                  <div className={`
                    w-14 h-14 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200
                    ${isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-gray-50 group-hover:border-gray-400'
                    }
                  `}>
                    <svg className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    All
                  </span>
                  {/* Active underline */}
                  {isActive && <div className="w-5 h-0.5 rounded-full bg-primary" />}
                </button>
              )
            }

            // Category with image
            return (
              <button
                key={cat.name}
                onClick={() => handleSelect(cat.name)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 group transition-all duration-200"
              >
                {/* Image circle */}
                <div className={`
                  w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-200
                  ${isActive
                    ? 'border-primary shadow-md scale-105'
                    : 'border-transparent group-hover:border-gray-300 group-hover:scale-105'
                  }
                `}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // fallback: hide the img and show initials
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement.classList.add('bg-primary/10')
                    }}
                  />
                </div>
                {/* Label */}
                <span className={`text-xs font-semibold whitespace-nowrap max-w-[72px] truncate ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {cat.name}
                </span>
                {/* Active underline */}
                {isActive && <div className="w-5 h-0.5 rounded-full bg-primary" />}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CategoryStrip

