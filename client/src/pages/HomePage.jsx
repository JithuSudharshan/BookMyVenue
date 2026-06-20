import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page-container">
      <div className="hero-section">
        <h1 className="headline-xl hero-title">Find the Perfect Space for Your Next Event</h1>
        <p className="body-lg hero-subtitle">
          Book unique, high-end venues for corporate gatherings, weddings, and premium celebrations.
        </p>
        <div className="hero-actions">
          <button className="cta-button explore-btn">Explore Venues</button>
          <Link to="/customer/profile" className="secondary-btn manage-profile-btn">
            Customer Profile
          </Link>
          {/* <Link to="/vendor/profile" className="secondary-btn manage-profile-btn" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>
            Vendor Profile
          </Link> */}
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h3 className="headline-sm">Curated Spaces</h3>
          <p className="body-sm text-muted">
            Every listed venue is vetted by our hospitality team to guarantee premium service and top-tier amenities.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="headline-sm">Instant Booking</h3>
          <p className="body-sm text-muted">
            Check availability, schedule walk-throughs, and secure your event dates with our automated contract system.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="headline-sm">Elite Service</h3>
          <p className="body-sm text-muted">
            Access dedicated event planners and local property managers to ensure your occasion is executed flawlessly.
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-page-container {
          max-width: var(--spacing-container-max);
          margin: 0 auto;
          padding: 64px var(--spacing-margin-desktop);
          display: flex;
          flex-direction: column;
          gap: 64px;
          animation: fadeInHome var(--transition-normal);
        }

        .hero-section {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-stack-md);
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          color: var(--on-surface);
        }

        .hero-subtitle {
          color: var(--secondary);
          line-height: 1.6;
          margin-bottom: var(--spacing-stack-sm);
        }

        .hero-actions {
          display: flex;
          gap: var(--spacing-stack-md);
          align-items: center;
        }

        .explore-btn {
          padding: 12px 28px;
          font-size: 16px;
        }

        .manage-profile-btn {
          padding: 11px 28px;
          font-size: 16px;
          text-decoration: none;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-gutter);
          margin-top: 24px;
        }

        .feature-card {
          background-color: var(--surface);
          border: 1px solid var(--outline-variant);
          border-radius: var(--rounded-md);
          padding: 32px 24px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-stack-sm);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--outline);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--rounded-default);
          background-color: var(--brand-subtle);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-base);
        }

        @keyframes fadeInHome {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .home-page-container {
            padding: 32px var(--spacing-margin-mobile);
            gap: 40px;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
          }
          .explore-btn, .manage-profile-btn {
            width: 100%;
            text-align: center;
          }
        }
      ` }} />
    </div>
  );
}

export default HomePage;
