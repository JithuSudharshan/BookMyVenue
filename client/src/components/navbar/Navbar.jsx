import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiMenu, FiSearch, FiX } from 'react-icons/fi'

/**
 * Navbar — two visual modes:
 *
 * 1. HERO MODE (scrolled=false, only on "/" home):
 *    Logo | nav links | menu button
 *    Transparent-to-white background
 *
 * 2. SCROLLED MODE (scrolled=true):
 *    Logo | compact search pill | menu button
 *    Solid white background
 */
const Navbar = ({ scrolled = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const menuRef = useRef(null)

  // — Compact search state (mini pill in navbar) —
  const [compactLocation, setCompactLocation] = useState('')

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCompactSearch = () => {
    const params = new URLSearchParams()
    if (compactLocation) params.set('location', compactLocation)
    navigate(`/venues?${params.toString()}`)
    setSearchExpanded(false)
    setCompactLocation('')
  }

  // Show compact search pill when: on home page AND scrolled past hero
  const showCompactSearch = isHome && scrolled

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border h-[72px] flex items-center shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center w-full gap-4">

        {/* Left: Logo */}
        <Link
          to="/"
          className="text-primary font-extrabold text-2xl tracking-tight flex-shrink-0"
        >
          BookMyVenue
        </Link>

        {/* Center: Compact search pill (Airbnb style) — shown when scrolled or not on home */}
        {showCompactSearch && (
          <div className="flex-1 flex justify-center max-w-xl mx-4">
            {searchExpanded ? (
              /* Expanded inline search */
              <div className="flex items-center w-full bg-white border border-gray-300 rounded-full shadow-md overflow-hidden">
                <FiSearch className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={compactLocation}
                  onChange={(e) => setCompactLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCompactSearch()}
                  placeholder="Search venues in Kerala..."
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-dark placeholder-gray-400"
                />
                <button
                  onClick={handleCompactSearch}
                  className="m-1.5 px-4 py-2 bg-primary hover:bg-red-700 text-white text-sm font-semibold rounded-full transition-colors flex-shrink-0"
                >
                  Search
                </button>
                <button
                  onClick={() => { setSearchExpanded(false); setCompactLocation('') }}
                  className="mr-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close search"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Collapsed pill — click to expand */
              <button
                onClick={() => setSearchExpanded(true)}
                className="
                  flex items-center gap-3 border border-gray-200 rounded-full
                  px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-200
                  bg-white group w-full max-w-sm
                "
              >
                <FiSearch className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-400 font-medium flex-1 text-left truncate">
                  Search venues in Kerala…
                </span>
                <span className="hidden sm:flex items-center gap-2 text-xs text-gray-400 border-l border-gray-200 pl-3 flex-shrink-0">
                  <span>Any date</span>
                  <span>·</span>
                  <span>Any guests</span>
                </span>
              </button>
            )}
          </div>
        )}

        {/* Center (hero mode): nav links */}
        {!showCompactSearch && (
          <div className="hidden md:flex items-center space-x-8 text-dark font-medium">
            <Link to="/venues" className="group relative hover:text-primary transition-colors py-2">
              Explore Venues
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          </div>
        )}

        {/* Right: Vendor link + hamburger menu */}
        <div className="flex items-center gap-2 flex-shrink-0" ref={menuRef}>

          <Link
            to="/vendor-signup"
            className="hidden md:block px-4 py-2 text-sm font-semibold text-dark rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Become a Vendor
          </Link>

          <div className="relative">
            <button
              id="navbar-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2.5 hover:shadow-md transition-shadow bg-white"
            >
              <FiMenu className="w-4 h-4 text-dark" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-[200] animate-fade-in">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
                >
                  Sign up
                </Link>
                <hr className="my-1 border-gray-100" />
                <Link
                  to="/venues"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
                >
                  Explore Venues
                </Link>
                <Link
                  to="/vendor/register"
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
                >
                  Become a Vendor
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  )
}

export default Navbar

