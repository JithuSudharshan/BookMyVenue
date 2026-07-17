import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

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

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border h-[72px] flex items-center shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center w-full">

        {/* Left: Logo */}
        <Link to="/" className="text-primary font-extrabold text-2xl tracking-tight flex-shrink-0">
          BookMyVenue
        </Link>

        {/* Center: Nav Links */}
        <div className="hidden md:flex items-center space-x-8 text-dark font-medium">
          <Link to="/venues" className="group relative hover:text-primary transition-colors py-2">
            Explore Venues
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
        </div>

        {/* Right: Hamburger menu only */}
        <div className="flex items-center gap-2" ref={menuRef}>

          {/* Become a Vendor — always visible on desktop */}
          <Link
            to="/api/auth/register-vendor"
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

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
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
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
