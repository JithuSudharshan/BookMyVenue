import React from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'

const SectionHeader = ({ title, subtitle, actionText, actionLink }) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12">
      <div className="mb-4 md:mb-0 max-w-2xl">
        <h2 className="text-[42px] font-extrabold text-dark mb-3 leading-tight">{title}</h2>
        {subtitle && <p className="text-[18px] text-[#6B7280]">{subtitle}</p>}
      </div>
      {actionText && actionLink && (
        <Link 
          to={actionLink} 
          className="hidden sm:flex items-center text-primary font-semibold hover:text-red-700 transition-colors text-lg whitespace-nowrap"
        >
          {actionText} <FiArrowRight className="ml-2" />
        </Link>
      )}
    </div>
  )
}

export default SectionHeader
