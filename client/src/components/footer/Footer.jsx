import React from 'react'
import { FiGlobe } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h3 className="text-primary font-bold text-xl mb-4">BookMyVenue</h3>
            <p className="text-secondary leading-relaxed">
              The premium destination for finding and booking exceptional spaces for your next big event.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-semibold text-dark mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-secondary hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/partner" className="text-secondary hover:text-primary transition-colors">Partner Program</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-semibold text-dark mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-secondary hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="/help" className="text-secondary hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-semibold text-dark mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-secondary hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-secondary hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-secondary text-sm">
          <p>&copy; 2026 BookMyVenue. All rights reserved.</p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <FiGlobe />
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
