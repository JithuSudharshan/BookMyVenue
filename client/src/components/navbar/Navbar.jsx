import React from 'react'
import { Link } from 'react-router-dom'


const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border h-[72px] flex items-center shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center w-full">

        {/* Left: Logo and Links */}
        <div className="flex items-center space-x-10">
          {/* Logo */}
          <Link to="/" className="text-primary font-extrabold text-2xl tracking-tight">
            BookMyVenue
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-8 text-dark font-medium">

            <Link to="/venues" className="group relative hover:text-primary transition-colors py-2">
              Venues
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <Link to="/vendor/register" className="group relative hover:text-primary transition-colors py-2">
              List Your Space
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-6">

          <button className="bg-primary hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
