import React, { useState, useEffect, useRef, useContext } from 'react'
import { AuthContext } from '../../store/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiMenu, FiSearch, FiX } from 'react-icons/fi'
import { NotificationDropdown } from '../common/NotificationDropdown'

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

  const { user, logout } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const menuRef = useRef(null)
  const avatarRef = useRef(null)

  // — Compact search state (mini pill in navbar) —
  const [compactLocation, setCompactLocation] = useState('')

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false)
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
    <nav className="sticky top-0 z-navbar bg-white/95 backdrop-blur-md border-b border-border h-[72px] flex items-center shadow-sm transition-all duration-300">
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
                  className="m-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-full transition-colors flex-shrink-0"
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

        {/* Right: Actions and Profile */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {(!user || user.role === 'customer') && (
            <Link
              to="/vendor-signup"
              className="hidden md:block px-4 py-2 text-sm font-semibold text-dark rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Become a Vendor
            </Link>
          )}
          {user?.role === 'vendor' && (
            <Link
              to="/vendor/dashboard"
              className="hidden md:block px-4 py-2 text-sm font-semibold text-dark rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Vendor Portal →
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="hidden md:block px-4 py-2 text-sm font-semibold text-dark rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Admin Panel →
            </Link>
          )}

          {!user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-dark rounded-full hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Log in
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Sign up
                </Link>
              </div>

              {/* Mobile Hamburger */}
              <div className="relative md:hidden" ref={menuRef}>
                <button
                  id="navbar-menu-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2.5 hover:shadow-md transition-shadow bg-white"
                >
                  <FiMenu className="w-4 h-4 text-dark" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-dropdown animate-fade-in">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors">
                      Log in
                    </Link>
                    <Link to="/signup" onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                      Sign up
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <Link to="/venues" onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                      Explore Venues
                    </Link>
                    <Link to="/vendor-signup" onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                      Become a Vendor
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 overflow-hidden hover:shadow-md transition-shadow bg-primary text-white font-semibold"
              >
                {user.profile?.profileImage ? (
                  <img src={user.profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{(user.user?.name || user.name || user.user?.email || user.email || '?').charAt(0).toUpperCase()}</span>
                )}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-dropdown animate-fade-in">
                  {user.role === 'customer' && (
                    <>
                      <Link to="/customer/profile" onClick={() => setAvatarOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                        My Profile
                      </Link>
                      <Link to="/customer/bookings" onClick={() => setAvatarOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                        My Bookings
                      </Link>
                      <Link to="/customer/wishlist" onClick={() => setAvatarOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                        Wishlist
                      </Link>
                      <Link to="/customer/wallet" onClick={() => setAvatarOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                        Wallet
                      </Link>
                      <hr className="my-1 border-gray-100" />
                    </>
                  )}
                  {user.role === 'vendor' && (
                    <>
                      <Link to="/vendor/profile" onClick={() => setAvatarOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                        My Profile
                      </Link>
                      <Link to="/vendor/dashboard" onClick={() => setAvatarOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                        Vendor Portal
                      </Link>
                      <hr className="my-1 border-gray-100" />
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin/dashboard" onClick={() => setAvatarOpen(false)} className="block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors">
                        Admin Dashboard
                      </Link>
                      <hr className="my-1 border-gray-100" />
                    </>
                  )}
                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left block px-5 py-3 text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar



