import React, { useState, useEffect } from 'react'
import CategoryCard from './CategoryCard'
import { getHomeData } from '../../api/user-api/userApi'
import { CategorySkeleton } from '../common/Skeleton'

const CategorySection = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Simulate a slight network delay to showcase skeleton if needed
        const result = await getHomeData()
        setCategories(result.popularCategories || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <section className="py-20 bg-white min-h-[400px]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12">
          <h2 className="text-[42px] font-extrabold text-dark mb-3 leading-tight">Popular Categories</h2>
          <p className="text-[18px] text-[#6B7280]">Discover venues by your specific event needs.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => <CategorySkeleton key={idx} />)
          ) : (
            categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
