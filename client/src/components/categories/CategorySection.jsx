import React, { useState, useEffect } from 'react'
import { getHomeData } from '../../api/user-api/userApi'
import { TabSkeleton } from '../common/Skeleton'

// Emoji icon map for known category names
const ICON_MAP = {
  'Wedding':    '💍',
  'Corporate':  '🏢',
  'Cafe':       '☕',
  'Party':      '🎉',
  'Party Hall': '🎉',
  'Outdoor':    '🌿',
  'Studio':     '🎨',
  'Sports':     '⚽',
  'Conference': '📊',
  'Banquet':    '🥂',
  'Resort':     '🏖️',
  'Rooftop':    '🌆',
  'Default':    '🏛️',
}

const getIcon = (name = '') => {
  // Exact match first
  if (ICON_MAP[name]) return ICON_MAP[name]
  // Partial match
  const key = Object.keys(ICON_MAP).find(k => name.toLowerCase().includes(k.toLowerCase()))
  return key ? ICON_MAP[key] : ICON_MAP['Default']
}

const CategorySection = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState('all')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getHomeData()
        setCategories(result.popularCategories || [])
      } catch (error) {

      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleTabClick = (id) => {
    setActiveId(id)
    if (onCategoryChange) onCategoryChange(id)
  }

  const allTab = { id: 'all', name: 'All' }
  const tabs = [allTab, ...categories]

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 lg:px-8">
        <div
          className="flex gap-8 overflow-x-auto py-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TabSkeleton key={i} />)
            : tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    flex flex-col items-center gap-1 pb-1 flex-shrink-0 min-w-[56px]
                    border-b-2 text-sm transition-all duration-200
                    ${activeId === tab.id
                      ? 'border-dark text-dark'
                      : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-2xl leading-none">
                    {getIcon(tab.name)}
                  </span>
                  <span className="font-medium text-xs whitespace-nowrap">
                    {tab.name}
                  </span>
                </button>
              ))
          }
        </div>
      </div>
    </div>
  )
}

export default CategorySection

