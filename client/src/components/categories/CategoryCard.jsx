import React from 'react'

const CategoryCard = ({ category }) => {

  return (
    <div className="group relative h-[260px] lg:h-[300px] rounded-[20px] overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      <h3 className="absolute bottom-6 left-6 text-white font-extrabold text-2xl tracking-wide">
        {category.name}
      </h3>
    </div>
  )
}

export default CategoryCard
