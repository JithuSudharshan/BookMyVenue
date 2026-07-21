import React from 'react'

export const CardSkeleton = ({ height = 'h-[300px]' }) => {
  return (
    <div className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full w-full">
      <div className={`w-full bg-gray-200 animate-pulse ${height}`}></div>
      <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-5"></div>
        </div>
        <div className="border-t border-gray-100 pt-5 flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export const CategorySkeleton = () => {
  return (
    <div className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm">
      <div className="w-full h-[200px] bg-gray-200 animate-pulse"></div>
      <div className="p-5 flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}

// Airbnb-style card skeleton — no border, image-first, slim info below
export const AirbnbCardSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-[280px]">
      <div className="w-full aspect-[4/3] rounded-2xl bg-gray-200 animate-pulse mb-3"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/5 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/5"></div>
    </div>
  )
}

// Slim category tab skeleton
export const TabSkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
}
