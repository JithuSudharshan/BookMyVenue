import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch, FiMapPin, FiUsers,
  FiMoreVertical, FiChevronLeft, FiChevronRight,
  FiCheckCircle, FiClock, FiSend, FiFileText, FiXCircle
} from 'react-icons/fi'
import { getVendorVenues } from '../../api/vendor-api/vendorApi'
import VenueCard from '../../components/vendor/VenueCard'

// ─── Tab config ─────────────────────────────────────────────────────────────
const TABS = [
  { key: 'approved', label: 'Approved', icon: FiCheckCircle, color: 'text-green-600', activeBorder: 'border-green-600', activeText: 'text-green-600' },
  { key: 'under review', label: 'Under Review', icon: FiClock, color: 'text-amber-500', activeBorder: 'border-amber-500', activeText: 'text-amber-500' },
  { key: 'submitted', label: 'Submitted', icon: FiSend, color: 'text-blue-500', activeBorder: 'border-blue-500', activeText: 'text-blue-500' },
  { key: 'draft', label: 'Drafts', icon: FiFileText, color: 'text-gray-500', activeBorder: 'border-gray-500', activeText: 'text-gray-600' },
  { key: 'rejected', label: 'Rejected', icon: FiXCircle, color: 'text-red-500', activeBorder: 'border-red-500', activeText: 'text-red-500' },
]

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
]


// ─── Main Page ───────────────────────────────────────────────────────────────
const VenueManagement = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('approved')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [isActiveFilter, setIsActiveFilter] = useState('all') // 'all', 'true', 'false'

  const [venues, setVenues] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPagination(p => ({ ...p, currentPage: 1 }))
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    fetchVenues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, debouncedSearch, sort, isActiveFilter, pagination.currentPage])

  const fetchVenues = async () => {
    setLoading(true)
    try {
      const params = {
        status: activeTab,
        search: debouncedSearch,
        sort: sort,
        page: pagination.currentPage,
        limit: 12
      }
      if (isActiveFilter !== 'all') {
        params.isActive = isActiveFilter
      }

      const response = await getVendorVenues(params)

      // Handle either standard array or paginated object from server
      if (Array.isArray(response)) {
        setVenues(response)
        setPagination({ currentPage: 1, totalPages: 1 })
      } else if (response && response.venues) {
        setVenues(response.venues)
        setPagination(response.pagination || { currentPage: 1, totalPages: 1 })
      } else {
        setVenues([])
      }
    } catch (err) {
      console.error('Failed to fetch venues:', err)
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
    setPagination(p => ({ ...p, currentPage: 1 }))
  }

  const handleViewDetails = (venue) => {
    navigate(`/vendor/venues/${venue._id || venue.id}`)
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-[#F8F9FA]">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Venue Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your venues, track their status and performance.</p>
        </div>

        {/* Search & Sort Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-64 focus-within:border-primary transition-colors">
            <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search venues by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder-gray-400"
            />
          </div>

          {/* Active/Inactive Filter Dropdown */}
          <div className="relative">
            <select
              value={isActiveFilter}
              onChange={e => { setIsActiveFilter(e.target.value); setPagination(p => ({ ...p, currentPage: 1 })) }}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-gray-600 hover:border-gray-300 focus:outline-none focus:border-primary shadow-sm cursor-pointer transition-colors"
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPagination(p => ({ ...p, currentPage: 1 })) }}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-gray-600 hover:border-gray-300 focus:outline-none focus:border-primary shadow-sm cursor-pointer transition-colors"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Tabs ─────────────────────────────────────── */}
      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${isActive
                  ? `${tab.activeBorder} ${tab.activeText}`
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-400'}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Main Content Area ───────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {venues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-lg font-bold text-dark mb-2">No venues found</h3>
              <p className="text-sm text-gray-400 mb-6">
                {debouncedSearch ? `No venues match "${debouncedSearch}"` : `You have no venues in this category yet.`}
              </p>
              <button
                onClick={() => navigate('/vendor/venues/add')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
              >
                + Add New Venue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {venues.map(venue => (
                <VenueCard
                  key={venue._id || venue.id}
                  venue={venue}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* ── Server-side Pagination ───────────────────────── */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))}
                  disabled={pagination.currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination(p => ({ ...p, currentPage: page }))}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors shadow-sm ${pagination.currentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(pagination.totalPages, p.currentPage + 1) }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default VenueManagement
