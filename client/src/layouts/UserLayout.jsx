import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/navbar/Navbar'
import Footer from '../components/footer/Footer'

const UserLayout = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [scrolled, setScrolled] = useState(!isHome) // non-home pages always show compact search

  useEffect(() => {
    // Reset when navigating
    setScrolled(!isHome)
    if (!isHome) return

    // On home page, watch whether we've scrolled past the hero's search sentinel
    const onScroll = () => {
      // Show compact pill once user scrolls more than ~300px (past the hero search bar)
      setScrolled(window.scrollY > 280)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome, location.pathname])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar scrolled={scrolled} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default UserLayout

